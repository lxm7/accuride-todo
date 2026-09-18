import "server-only";
import type { Locale } from "@/i18n/routing";

type LandingPageResponse = {
  data: { landingPage: { heading: string } };
};

export const getLandingPage = async (locale: Locale) => {
  const res = await fetch(process.env.HYGRAPH_ENDPOINT as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
    },
    body: JSON.stringify({
      query: `query LandingPage($locale: Locale!) {
        landingPage(where: { slug: "home" }, stage: PUBLISHED, locales: [$locale]) {
          heading
        }
      }`,
      variables: { locale },
    }),
    next: { tags: ["cms"], revalidate: 300 },
  });

  const json = (await res.json()) as LandingPageResponse;

  return json.data.landingPage;
};
