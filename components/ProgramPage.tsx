"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useAnimationFrame, useMotionValue, type Variants } from "framer-motion";
import SmoothScroll from "./SmoothScroll";
import styles from "./ProgramPage.module.css";

const EASE = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

type Section = {
  id: string;
  index: string;
  title: string;
  body?: string[];
  points?: string[];
  subsections?: { label: string; body: string[] }[];
};

const intro = {
  kicker: "Algehele lijn",
  slogan: "Zekerheid, groei en waardigheid",
  body: "Het behouden en versterken van essentiële voorzieningen, voor zekerheid. De markt open houden voor ondernemers en innovatie, voor groei. Het sociale systeem behouden voor de benadeelden, zodat iedereen een beschaafde levensstandaard heeft.",
};

const sections: Section[] = [
  {
    id: "landbouw",
    index: "01",
    title: "Landbouw & Stikstof",
    body: [
      "De stikstofimpasse is voorbij. We hanteren dezelfde stikstofnorm als Duitsland, zodat de implicaties van de EU-regel eerlijk zijn voor alle deelstaten. Zo behouden we onze boeren, ons boerenlandschap, en een grote eigen voedselproductie die ons zelfstandig en voedselzeker houdt. Een essentieel goed.",
    ],
    points: [
      "Stikstofnorm herinterpreteren zoals Duitsland",
      "Indien nodig, de stikstofnorm in de reet van de EU steken",
    ],
  },
  {
    id: "internationaal",
    index: "02",
    title: "Internationaal",
    subsections: [
      {
        label: "Oekraïne",
        body: [
          "Eventueel onderhandelen om het kleine Russisch-talige stukje aan Rusland te geven — maar de rest dan ook meteen dichtsluiten en NAVO maken. Zo ontstaat een verstandhouding voor de toekomst. We moeten zowel strategisch als diplomatiek slim met de situatie omgaan: Rusland niet uitlokken, maar het ook niet onnodig in een strategisch voordeel zetten.",
          "Het beste is een goed diplomatiek gesprek waarin de belangen van beide partijen eerlijk op tafel komen. De vraag daaruit is: kunnen we Ruslands belangen bevredigen en uitsluiten dat dit een gevaar voor de EU wordt? Blijkt er toch een imperialistische ambitie, dan gaan we door met het verzwakken van Rusland in het belang van de Europese veiligheid.",
          "Rusland, dat op sommige vlakken dezelfde toon aanslaat als extreem-rechts, zal wellicht positiever tegenover ons komen te staan als we ook interne kwesties zoals immigratie aanpakken. We moeten dus ook peilen in welke mate er sprake is van een culturele of waardenbotsing.",
        ],
      },
      {
        label: "Middenoosten",
        body: [
          "Als Nederland hebben we weinig invloed op en te maken met de geopolitiek in het Midden-Oosten. We nemen een gereserveerde houding aan — we hebben immers onze eigen problemen.",
        ],
      },
    ],
    points: ["Rusland niet demoniseren"],
  },
  {
    id: "eu",
    index: "03",
    title: "EU",
    body: [
      "We laten het lot van ons land niet bepalen door de EU. We nemen goed beleid van de EU over, maar bij sterke dilemma's gaat het eigen geweten voor — en verlaten we desnoods de EU als zij niet met ons om tafel wil. Zo werkt vetorecht ook. Tegelijkertijd proberen we de EU, zolang we er nog in zitten, de goede kant op te trekken.",
    ],
    points: [
      "Beperkingen op stikstof negeren, boetes aanvaarden",
      "Eventueel de EU verlaten",
    ],
  },
  {
    id: "defensie",
    index: "04",
    title: "Defensie",
    body: [
      "Gewoon een goede en sterke defensie regelen in deze roerige tijden. Maar zonder oorlogshitserij, en zoveel mogelijk in het belang van Nederland — geen internationale of offensieve acties. Defensie zo lang mogelijk op tech en professionals houden, niet op het mobiliseren van de burger.",
    ],
    points: ["Dienstplicht niet uitbreiden"],
  },
  {
    id: "zorg",
    index: "05",
    title: "Zorg",
    body: [
      "Een vernauwing van de focus op ernstige, zorg-technische zaken. Verder aandringen op eigen verantwoordelijkheid en het respecteren van het natuurlijke verloop. Alle soft zorg afschalen, het medisch-industrieel complex afschalen, geen peperdure behandelingen voor bejaarden. De zorg moet er primair zijn voor ernstige, acute medische kwalen.",
      "Ook moeten we perspectief houden en niet alles op één hoop gooien dat dan maar betaald moet worden. Realisme. Daarnaast probeert de overheid de levensstijl van burgers te bevorderen: preventie, en het reduceren van negatieve prikkels zoals reclame voor fastfood. Zo blijven we een gezond en vitaal land.",
    ],
    points: [
      "Maatschappijbrede analyse en inzet op preventie",
      "Afschalen soft zorg en medisch-industrieel complex",
      "Realisme in de zorg voor bejaarden",
    ],
  },
  {
    id: "bestuur",
    index: "06",
    title: "Bestuur",
    body: [
      "Algehele verkleining van de overheid. Heel veel administratieve processen kunnen geautomatiseerd worden, zoals bij gemeentes. Ook het show-element van de politicus is eigenlijk niet goed — het moet meer gaan om inhoud dan om partijpolitiek spektakel. Verder een algehele hygiëne om regels klein en kernachtig te houden, met de acceptatie dat er altijd randgevallen zullen blijven.",
      "Politici moeten in debat aantijgingen negeren en zich richten op inhoudelijke materie: een professionele insteek, minder ge-influence en culture war. De politicus moet inhoudelijk en laconiek zijn, en beschaafdheid en verantwoordelijkheid uitstralen.",
    ],
    points: [
      "Automatiseringsslag maken",
      "Richten op inhoud in debatten, niet op geroddel en vuilmakerij — bijvoorbeeld een regel om niet te mogen afwijken van het debatonderwerp",
    ],
  },
  {
    id: "klimaat",
    index: "07",
    title: "Klimaat & milieu",
    body: [
      "Het is goed om milieuhygiëne te hanteren: minder (nano)plastic, controle op giftige stoffen, en ziekteverwekkende stoffen uit de maatschappij weren.",
    ],
  },
  {
    id: "energie",
    index: "08",
    title: "Energie",
    body: [
      "Innovaties zoals elektrisch rijden zijn welkom. Een elektrische economie moet niet alleen utopisch zijn, maar ook haalbaar — hebben we een oplossing voor het elektriciteitsnet? Kunnen we binnen de EU slim delen in energie, zodat een zonnig land als Spanje bijvoorbeeld meer zonne-energie opwekt?",
      "Geen visie top-down en ideologisch doorvoeren zonder dat die aan haalbaarheid is getoetst. Als de omslag in energie ons de armoede in sleept, is het verstandiger te wachten op toekomstige innovaties en onze bestaande voorzieningen en voorraden te behouden — een hybride weg. Ook het klimaatnarratief en de paniekstemmingmakerij eromheen met een korrel zout nemen.",
    ],
    points: [
      "Stoppen met overheidsbemoeienis met energie en klimaatpaniekzaaierij",
      "Gas uit Groningen gebruiken en Groningers ruim compenseren",
    ],
  },
  {
    id: "immigratie",
    index: "09",
    title: "Immigratie & demografie",
    body: [
      "De massa-immigratie is de grootste politieke fout van de laatste decennia — een globalistisch bijproduct dat ons sociaal en politiek kwetsbaar heeft gemaakt.",
      "Europa en de Anglosfeer vormen de Westerse beschaving. Wij geloven dat de Westerse beschaving in oorsprong voor Europeanen is. Daarom is het belangrijk dat we acuut stoppen met de massa-immigratie en de juiste maatregelen nemen om te zorgen dat Europa ook Europees blijft.",
      "Vluchtelingen vangen we op aan de grens. Nieuwkomers maken we zelf. Alle positieve-diversiteitsmaatregelen halen we weg, en langzaam zetten we in op het stimuleren van remigratie.",
    ],
    points: [
      "Stoppen met het verlenen van asiel",
      "Mensen die er zijn terugsturen naar het land van herkomst",
      "VN-vluchtelingenverdrag en het Marrakeshpact opzeggen",
      "Regels van de Europese Unie negeren, eventueel procederen of in het ergste geval een boete betalen",
      "Opvang aan de grens realiseren",
      "Illegaliteit strafbaar stellen",
      "Landen die weigeren terug te nemen, straffen met sancties",
      "Remigratie voor mensen die hier niet aarden",
    ],
  },
  {
    id: "wonen",
    index: "10",
    title: "Wonen",
    body: [
      "De woningcrisis is mede veroorzaakt doordat het inheemse geboortecijfer niet stijgt terwijl de bevolking wel groeit. We willen niet in paniek grote aantallen slechte prefabwoningen bouwen zoals tijdens de wederopbouw — dat is immers ook niet bepaald duurzaam.",
      "Laten we het bestaande woningportfolio herschikken, met voorrang voor jonge gezinnen. De woningcrisis is namelijk een van de grootste belemmerende factoren voor gezinsstichting.",
    ],
  },
  {
    id: "sociaal",
    index: "11",
    title: "Sociaal",
    body: [
      "Er moet een basislevensstandaard zijn voor elke burger van Nederland — iedereen heeft recht op onderdak en voedsel. Mocht AI de economie drastisch veranderen, dan zouden we eventueel naar een UBI (universeel basisinkomen) kunnen kijken, maar dat is nog toekomstmuziek. Uiteraard krijgen mensen geen overheidssteun om die vervolgens te vergokken of aan drugs of andere zinloze zaken uit te geven.",
    ],
  },
  {
    id: "onderwijs",
    index: "12",
    title: "Onderwijs",
    body: [
      "Onderwijs gewoon goed maken — alle softe onzin eruit. En ook de vrijheid voor thuisonderwijs openstellen.",
    ],
    points: ["Thuisonderwijs legaliseren"],
  },
  {
    id: "ondernemen",
    index: "13",
    title: "Ondernemen",
    body: [
      "Ondernemen is innovatie en kan leiden tot grote doorbraken — een non-lineair proces. We moeten ondernemen in ons land altijd stimuleren, en niet lastigvallen met ontelbare drempels en regelgeving.",
    ],
    points: ["Box 3 afschaffen", "Geen erfbelasting"],
  },
  {
    id: "economie",
    index: "14",
    title: "Economie",
    body: [
      "Verstandig economisch beleid voeren, zoals de Zwitserse bank. Geen oneindige groei nastreven, en de cyclus van schuldenbubbels stoppen door geldcreatie ('quantitative easing') aan banden te leggen.",
    ],
  },
];

export default function ProgramPage() {
  const [activeId, setActiveId] = useState<string>(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocWrapRef = useRef<HTMLElement>(null);
  const tocInnerRef = useRef<HTMLDivElement>(null);
  const tocY = useMotionValue(0);

  // CSS `position: sticky` doesn't stick on this site: `overflow-x: hidden` on
  // html/body (globals.css) makes the browser treat body as the sticky
  // containing block instead of the viewport, so it never engages (same root
  // class of problem About.tsx works around for a different reason). The fix
  // there — and here — is to keep the wrapper tall and drive a `translateY`
  // on the actual content by hand every frame instead.
  useAnimationFrame(() => {
    const wrap = tocWrapRef.current;
    const inner = tocInnerRef.current;
    if (!wrap || !inner) return;

    const stickyOffset = Math.min(48, Math.max(24, window.innerWidth * 0.04));
    const wrapRect = wrap.getBoundingClientRect();
    const innerHeight = inner.offsetHeight;

    const desiredTop = Math.min(
      Math.max(wrapRect.top, stickyOffset),
      wrapRect.bottom - innerHeight
    );

    tocY.set(desiredTop - wrapRect.top);
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    sections.forEach((section) => {
      const el = sectionRefs.current[section.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.page}>
      <SmoothScroll />

      <div className={styles.topbar}>
        <Link href="/" className={styles.wordmark}>
          Bob van Boekel
        </Link>
        <Link href="/" className={styles.back}>
          ← Terug naar home
        </Link>
      </div>

      <header className={styles.hero}>
        <span className={styles.kicker}>{intro.kicker}</span>
        <h1 className={styles.title}>Programma</h1>
        <p className={styles.slogan}>{intro.slogan}</p>
        <motion.p
          className={styles.introText}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {intro.body}
        </motion.p>
      </header>

      <div className={styles.layout}>
        <nav className={styles.toc} aria-label="Inhoudsopgave" ref={tocWrapRef}>
          <motion.div
            className={styles.tocInner}
            ref={tocInnerRef}
            style={{ y: tocY }}
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${styles.tocLink} ${
                  activeId === section.id ? styles.tocLinkActive : ""
                }`}
              >
                <span className={styles.tocIndex}>{section.index}</span>
                {section.title}
              </a>
            ))}
          </motion.div>
        </nav>

        <div className={styles.sections}>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              ref={(el) => {
                sectionRefs.current[section.id] = el;
              }}
              className={styles.section}
            >
              <span className={styles.sectionIndex}>{section.index}</span>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <div className={styles.sectionBody}>
                {section.subsections ? (
                  <div className={styles.subsections}>
                    {section.subsections.map((sub) => (
                      <div key={sub.label} className={styles.subsection}>
                        <span className={styles.subLabel}>{sub.label}</span>
                        {sub.body.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  section.body?.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))
                )}
              </div>
              {section.points && (
                <ul className={styles.points}>
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <Link href="/">Bob van Boekel</Link>
        <div className={styles.footerContact}>
          <a href="tel:+31651775569">06 51 77 55 69</a>
          <a href="mailto:bob@van-boekel.nl">bob@van-boekel.nl</a>
        </div>
      </footer>
    </div>
  );
}
