export type ProjectImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Project = {
  slug: string;
  title: string;
  kicker: string;
  description: string[];
  // Shown in the home page carousel and at the top of the project page.
  hero: ProjectImage;
  // Shown below the hero on the project page, in order.
  images: ProjectImage[];
};

export const projects: Project[] = [
  {
    slug: "de-dissident",
    title: "De Dissident",
    kicker: "Tijdschrift",
    description: [
      "Vormgeving voor tijdschrift De Dissident.",
      "Een rebels jongeren tijdschrift met kritische stukken over maatschappij en lifestyle.",
    ],
    hero: {
      src: "/images/projects/de-dissident/hero.jpg",
      width: 2200,
      height: 1500,
      alt: "Opengeslagen editie van De Dissident",
    },
    images: [
      {
        src: "/images/projects/de-dissident/36.png",
        width: 2200,
        height: 1400,
        alt: "Spread ‘Post-futurisme’ uit De Dissident",
      },
      {
        src: "/images/projects/de-dissident/34.png",
        width: 2200,
        height: 1500,
        alt: "Spread ‘Het langhuis in de badkamer’ en woordzoeker uit De Dissident",
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}
