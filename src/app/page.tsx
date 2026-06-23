import AmbientPlayer from '@/components/AmbientPlayer';
import ContactForm from '@/components/ContactForm';

export default function HomePage() {
  return (
    <>
      <header>
        <div className="topo">
          <div className="brand">
            <img className="brand-logo" src="/imagens/logo_neurovian_principal.png" alt="Logo Neurovian" />
            <h1>Neurovian</h1>
          </div>
          <nav className="main-nav" id="site-navigation">
            <a href="#inicio">Início</a>
            <a href="#servicos">Serviços</a>
            <a href="#vr-modos">Modos VR</a>
            <a href="#como-funciona">Fluxo</a>
            <a href="#clinica">Clínica</a>
            <a href="#contato">Contato</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="hero">
          <div className="hero-main">
            <div className="hero-copy">
              <p className="eyebrow">NEUROVIAN</p>
              <h1>A maior experiência VR para mentes criativas</h1>
              <p>
                Realidade virtual projetada para treinar foco, criatividade e redes neurais dentro
                de experiências imersivas.
              </p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#contato">
                  Fale com a equipe
                </a>
                <a className="btn btn-secondary" href="#como-funciona">
                  Como funciona
                </a>
              </div>
            </div>
            <div className="hero-media">
              <img className="hero-image" src="/imagens/logo_neurovian_principal.png" alt="Logotipo Neurovian" />
            </div>
          </div>
          <div className="hero-counters">
            <div className="counter-card">
              <strong>+250</strong>
              <p>Mundos neurais ativados</p>
            </div>
            <div className="counter-card">
              <strong>12</strong>
              <p>Camadas perceptivas exploradas</p>
            </div>
          </div>
        </section>

        <section id="vr-modos" className="vr-forest">
          <div className="section-header">
            <h2>Ambientes sonoros VR</h2>
            <p>Escolha um ambiente sonoro cadastrado pela equipe Neurovian e ative sua experiência imersiva.</p>
          </div>
          <AmbientPlayer />
        </section>

        <section id="servicos" className="servicos">
          <div className="section-header">
            <h2>Por que Neurovian?</h2>
            <p>
              Transformamos realidade virtual em um cérebro digital para treino cognitivo,
              produtividade e bem-estar mental.
            </p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <h3>NeuroMap VR</h3>
              <p>Mapeamento sensorial que ajusta a experiência ao estado cerebral do usuário em tempo real.</p>
            </article>
            <article className="feature-card">
              <h3>Modos imersivos</h3>
              <p>Ambientes VR projetados para ampliar foco, criatividade e adaptação emocional.</p>
            </article>
            <article className="feature-card">
              <h3>Sinapse digital</h3>
              <p>Feedback virtual que reforça conexões neurais e acelera a aprendizagem através da experiência.</p>
            </article>
          </div>
        </section>

        <section id="como-funciona" className="vr-forest">
          <div className="section-header">
            <h2>Como funciona</h2>
            <p>
              Um fluxo guiado de calibração, imersão, monitoramento e sinapse virtual para treinar a
              mente com segurança.
            </p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <span>01</span>
              <h3>Calibração</h3>
              <p>Usuários entram no ambiente VR e ajustam a experiência ao seu perfil cerebral.</p>
            </div>
            <div className="step-card">
              <span>02</span>
              <h3>Imersão</h3>
              <p>O sistema dispara missões virtuais que ativam memória, percepção e foco.</p>
            </div>
            <div className="step-card">
              <span>03</span>
              <h3>Monitorização</h3>
              <p>O desempenho é exibido em painéis de neurofeedback em tempo real.</p>
            </div>
            <div className="step-card">
              <span>04</span>
              <h3>Sinapse</h3>
              <p>Conexões entre mente e máquina criam novos padrões de aprendizagem.</p>
            </div>
          </div>
        </section>

        <section id="clinica" className="clinica">
          <div className="section-header">
            <h2>Aplicação clínica VR</h2>
            <p>Realidade virtual para apoiar terapias psicológicas com experiências seguras e personalizadas.</p>
          </div>
          <div className="clinica-copy">
            <p>
              Uma clínica especializada em saúde mental utiliza nossos ambientes VR para apoiar o
              tratamento de ansiedade, fobias, transtorno do estresse pós-traumático e depressão.
            </p>
            <div className="clinica-cards">
              <div className="clinica-card">
                <h3>Tratamento de ansiedade</h3>
                <p>Ambientes virtuais graduais ajudam os pacientes a enfrentar gatilhos com segurança.</p>
              </div>
              <div className="clinica-card">
                <h3>Abordagem a fobias</h3>
                <p>Exposição guiada em VR permite trabalhar fobias específicas em cenários controlados.</p>
              </div>
              <div className="clinica-card">
                <h3>Suporte ao TEPT</h3>
                <p>O VR auxilia no reprocessamento de memórias traumáticas com acompanhamento clínico.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contato" className="contact-section">
          <div className="section-header">
            <h2>Fale com a equipe</h2>
            <p>Envie sua solicitação. Nossa equipe responde por e-mail.</p>
          </div>
          <ContactForm />
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <img className="footer-logo" src="/imagens/logo_neurovian_principal.png" alt="Logo Neurovian" />
          <p>© 2026 Neurovian - Realidade virtual e neurociência.</p>
        </div>
      </footer>
    </>
  );
}
