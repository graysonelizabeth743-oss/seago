export default function PageIntro({ title, description, children }) {
  return (
    <section className="border-b border-line bg-soft">
      <div className="container-x py-12 sm:py-16">
        <h1 className="max-w-3xl text-3xl font-extrabold sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
        {children}
      </div>
    </section>
  );
}
