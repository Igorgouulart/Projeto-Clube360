// Validacao centralizada da configuracao de seguranca (segredos JWT).
//
// HS256 exige chave de no minimo 256 bits (RFC 7518, secao 3.2). Por isso cada segredo deve:
//   - estar em hexadecimal, base64 ou base64url (o formato produzido por crypto.randomBytes);
//   - ter pelo menos 32 bytes (256 bits) DEPOIS de decodificado;
//   - ter bytes decodificados nao repetitivos;
//   - nao ser um valor de exemplo/publico conhecido.
// Alem disso, JWT_ACCESS_SECRET e JWT_REFRESH_SECRET devem ser diferentes entre si.
//
// IMPORTANTE:
//   - A decodificacao serve SOMENTE para medir o tamanho. A assinatura continua usando o texto do
//     segredo exatamente como esta no .env (ver utils/jwt.ts), entao tokens ja emitidos continuam validos.
//   - Nenhuma mensagem deste modulo contem o valor, um trecho ou o tamanho de um segredo.

const BYTES_MINIMOS = 32;           // 256 bits
const BYTES_DISTINTOS_MINIMOS = 16; // 32 bytes aleatorios tem ~30 valores distintos; menos de 16 indica repeticao

// Valores publicos conhecidos: antigos fallbacks do jwt.ts e placeholders do .env.example.
const VALORES_PUBLICOS = new Set([
  'dev-access-secret-troque-em-producao',
  'dev-refresh-secret-troque-em-producao',
  'seu-segredo-de-exemplo',
  'seu-outro-segredo-de-exemplo',
]);
const PALAVRAS_DE_EXEMPLO = ['troque', 'exemplo', 'example', 'changeme', 'placeholder'];

export interface ProblemaConfig {
  variavel: string;
  problema: string;
}

/**
 * Decodifica o segredo se (e somente se) ele estiver em hexadecimal, base64 ou base64url.
 * Devolve null quando o formato for invalido. Texto arbitrario NAO e tratado como "256 bits".
 */
function decodificar(valor: string): Buffer | null {
  // Hexadecimal: somente 0-9a-f, quantidade par de caracteres.
  if (/^[0-9a-fA-F]+$/.test(valor)) {
    return valor.length % 2 === 0 ? Buffer.from(valor, 'hex') : null;
  }
  // Base64 (+ /) ou base64url (- _), com ate 2 "=" de preenchimento opcional.
  const m = /^([A-Za-z0-9+/_-]+)(={0,2})$/.exec(valor);
  if (!m) return null;
  const corpo = m[1];
  const preenchimento = m[2].length;
  const padrao = /[+/]/.test(corpo);
  const url = /[_-]/.test(corpo);
  if (padrao && url) return null;                                        // alfabetos misturados
  if (corpo.length % 4 === 1) return null;                               // tamanho impossivel em base64
  if (preenchimento > 0 && (corpo.length + preenchimento) % 4 !== 0) return null; // "=" inconsistente
  return Buffer.from(corpo, url ? 'base64url' : 'base64');
}

/** Problemas de UM segredo (lista vazia = valido). Nunca inclui o valor nas mensagens. */
export function validarSegredo(variavel: string, valor: string | undefined): ProblemaConfig[] {
  const problema = (texto: string): ProblemaConfig[] => [{ variavel, problema: texto }];

  if (valor === undefined) return problema('não está definida');
  if (valor.trim() === '') return problema('está vazia');

  const minusculo = valor.toLowerCase();
  if (VALORES_PUBLICOS.has(valor) || PALAVRAS_DE_EXEMPLO.some((p) => minusculo.includes(p))) {
    return problema('é um valor de exemplo ou público conhecido');
  }

  const bytes = decodificar(valor);
  if (bytes === null) {
    return problema('formato inválido: use base64, base64url ou hexadecimal (gerado com crypto.randomBytes)');
  }

  const problemas: ProblemaConfig[] = [];
  if (bytes.length < BYTES_MINIMOS) {
    problemas.push({ variavel, problema: 'tem menos de 256 bits (32 bytes) depois de decodificado' });
  }
  if (new Set<number>(bytes).size < BYTES_DISTINTOS_MINIMOS) {
    problemas.push({ variavel, problema: 'tem pouca variedade de bytes (parece repetitivo, não aleatório)' });
  }
  return problemas;
}

/** Valida os dois segredos JWT e a relacao entre eles. */
export function validarSegredosJwt(env: NodeJS.ProcessEnv): ProblemaConfig[] {
  const acesso = env.JWT_ACCESS_SECRET;
  const refresh = env.JWT_REFRESH_SECRET;

  const problemas = [
    ...validarSegredo('JWT_ACCESS_SECRET', acesso),
    ...validarSegredo('JWT_REFRESH_SECRET', refresh),
  ];

  if (acesso !== undefined && refresh !== undefined && acesso.trim() !== '' && refresh.trim() !== '') {
    let iguais = acesso === refresh;
    if (!iguais) {
      const a = decodificar(acesso);
      const r = decodificar(refresh);
      iguais = a !== null && r !== null && a.equals(r); // mesmo segredo escrito em formatos diferentes
    }
    if (iguais) {
      problemas.push({ variavel: 'JWT_ACCESS_SECRET e JWT_REFRESH_SECRET', problema: 'devem ser diferentes entre si' });
    }
  }
  return problemas;
}

let segredosValidados: { acesso: string; refresh: string } | null = null;

/**
 * Entrega os segredos JWT ja validados. "Falha fechada": se a configuracao for invalida, lanca erro
 * (sem valores) e NUNCA recorre a um valor padrao.
 */
export function obterSegredosJwt(): { acesso: string; refresh: string } {
  if (segredosValidados) return segredosValidados;
  const problemas = validarSegredosJwt(process.env);
  if (problemas.length > 0) {
    throw new Error('Configuração JWT inválida: ' + problemas.map((p) => `${p.variavel} ${p.problema}`).join('; '));
  }
  segredosValidados = {
    acesso: process.env.JWT_ACCESS_SECRET as string,
    refresh: process.env.JWT_REFRESH_SECRET as string,
  };
  return segredosValidados;
}

/**
 * Chamada no inicio da partida do servidor. Se a configuracao for invalida: escreve a mensagem
 * (sem valores), espera o stderr ser descarregado e encerra o processo com codigo 1.
 * O Promise que nunca resolve garante que nenhum codigo depois do "await" seja executado.
 */
export async function validarConfiguracaoOuEncerrar(): Promise<void> {
  const problemas = validarSegredosJwt(process.env);
  if (problemas.length === 0) return;

  const linhas = [
    '',
    '❌ Configuração de segurança inválida: o backend NÃO foi iniciado.',
    ...problemas.map((p) => `   • ${p.variavel}: ${p.problema}`),
    '   Cada segredo precisa ter pelo menos 256 bits (32 bytes), em base64, base64url ou hexadecimal,',
    '   e JWT_ACCESS_SECRET e JWT_REFRESH_SECRET precisam ser diferentes entre si.',
    '   Para gerar um segredo forte (execute uma vez para cada variável):',
    `   node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`,
    '   Depois edite o arquivo backend/.env. Os valores dos segredos nunca são exibidos.',
  ];
  await new Promise<never>(() => {
    process.stderr.write(linhas.join('\n') + '\n', () => process.exit(1));
  });
}
