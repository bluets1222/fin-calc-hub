import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RedirectComplex({
  params,
}: Pick<PageProps<"/complex/[id]">, "params">) {
  const { id } = await params;
  redirect(`/real-estate/${id}`);
  return null;
}

export default function LegacyComplexRedirectPage({
  params,
}: PageProps<"/complex/[id]">) {
  return (
    <Suspense fallback={null}>
      <RedirectComplex params={params} />
    </Suspense>
  );
}
