export default function TermosDeUso() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-slate-700 antialiased">
      {/* Ajustei a cor base do texto para um cinza escuro, quase preto (text-slate-700) */}

      {/* Cabeçalho */}
      <header className="border-b border-slate-300 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-slate-950 tracking-tight mb-2">
          Termos de Uso e Isenção de Responsabilidade
        </h1>
        <p className="text-sm text-slate-500">
          Última atualização: Junho de 2026
        </p>
      </header>

      <p className="text-base leading-relaxed mb-6">
        Seja bem-vindo ao nosso projeto! Antes de explorar a plataforma, por
        favor, leia atentamente as condições abaixo. Ao utilizar este site, você
        concorda e está ciente de todas as diretrizes aqui expostas.
      </p>

      {/* Conteúdo Principal */}
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-2">
            1. Natureza Acadêmica do Projeto
          </h2>
          <p className="leading-relaxed">
            Este site foi desenvolvido exclusivamente como parte de um projeto
            de graduação universitária. Ele funciona como uma plataforma
            experimental e de aprendizado, não possuindo fins comerciais,
            estrutura empresarial ou garantias de nível de serviço (SLA).
          </p>
        </section>

        {/* Box de Alerta Ajustado */}
        <section className="bg-amber-100 border border-amber-300 rounded-lg p-4">
          <h2 className="text-xl font-semibold text-amber-900 mb-2 flex items-center gap-2">
            ⚠️ 2. Segurança e Uso de Senhas (Aviso Importante)
          </h2>
          <p className="leading-relaxed text-amber-950">
            Por se tratar de um ambiente de testes e desenvolvimento acadêmico,{" "}
            <strong>as medidas de segurança implementadas são básicas</strong>.
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-950/90">
            <li>
              <span className="font-bold">NÃO UTILIZE SENHAS REAIS:</span>{" "}
              Recomendamos fortemente que você crie uma senha fictícia e
              exclusiva para este site.
            </li>
            <li>
              Não utilize a mesma senha que você usa em seus e-mails, redes
              sociais ou serviços bancários.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-2">
            3. Isenção de Responsabilidade por Dados
          </h2>
          <p className="leading-relaxed">
            Os desenvolvedores empenham-se em proteger a plataforma dentro do
            escopo do aprendizado acadêmico. Contudo,{" "}
            <strong>
              não nos responsabilizamos por quaisquer incidentes de segurança,
              incluindo, mas não se limitando a: vazamentos de dados, perda de
              informações, invasões ou instabilidades no sistema.
            </strong>{" "}
            O uso da plataforma é de total e exclusiva responsabilidade do
            usuário.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-2">
            4. Transparência na Criação deste Documento
          </h2>
          <p className="leading-relaxed text-slate-600 italic">
            Em conformidade com as boas práticas de transparência e o uso ético
            da tecnologia, informamos que este Termo de Uso foi gerado por uma
            Inteligência Artificial (LLM) e revisado minuciosamente pela equipe
            de desenvolvedores para garantir que reflete a realidade jurídica e
            operacional do projeto.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-950 mb-2">
            5. Alterações e Encerramento
          </h2>
          <p className="leading-relaxed">
            A equipe se reserva o direito de modificar, suspender ou encerrar o
            site e seu banco de dados a qualquer momento, sem aviso prévio, seja
            para manutenção, avaliação acadêmica ou encerramento definitivo do
            ciclo do projeto.
          </p>
        </section>
      </div>

      {/* Rodapé do Termo */}
      <footer className="mt-12 pt-6 border-t border-slate-300 text-center text-sm text-slate-500">
        Obrigado por apoiar nosso projeto acadêmico!
      </footer>
    </div>
  );
}
