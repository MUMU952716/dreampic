import { Footer as FooterType } from "@/types/blocks/footer";
import Icon from "@/components/icon";

export default function Footer({ footer }: { footer: FooterType }) {
  if (footer.disabled) {
    return null;
  }

  return (
    <section id={footer.name} className="py-16">
      <div className="max-w-7xl mx-auto px-8">
        <footer>
          <div className="flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left">
            <div className="flex w-full max-w-96 shrink flex-col items-center justify-between gap-6 lg:items-start">
              {footer.brand && (
                <div>
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    {footer.brand.logo?.src && (
                      <img
                        src={footer.brand.logo.src}
                        alt={footer.brand.logo.alt || footer.brand.title}
                        className="h-11 object-contain"
                      />
                    )}
                    {(footer.brand.title || !footer.brand.logo?.src) && (
                      <p className="text-xl font-semibold text-foreground">
                        {footer.brand.title || "DreamPic"}
                      </p>
                    )}
                  </div>
                  {footer.brand.description && (
                    <p className="mt-6 text-md text-muted-foreground">
                      {footer.brand.description}
                    </p>
                  )}
                </div>
              )}
              {footer.social && (
                <ul className="flex items-center space-x-6 text-muted-foreground">
                  {footer.social.items?.map((item, i) => (
                    <li key={i} className="font-medium hover:text-primary">
                      <a href={item.url} target={item.target}>
                        {item.icon && (
                          <Icon name={item.icon} className="size-4" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex gap-6 lg:gap-20 flex-wrap lg:flex-nowrap">
              {footer.nav?.items?.map((item, i) => (
                <div key={i}>
                  <p className="mb-6 font-bold">{item.title}</p>
                  <ul className="space-y-4 text-sm text-muted-foreground">
                    {item.children?.map((iitem, ii) => (
                      <li key={ii} className="font-medium hover:text-primary">
                        <a href={iitem.url} target={iitem.target}>
                          {iitem.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-between gap-4 border-t pt-8 text-center text-sm font-medium text-muted-foreground lg:flex-row lg:items-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start flex-wrap">
              {footer.copyright && (() => {
                const emailMatch = footer.copyright.match(/\S+@\S+\.\S+/);
                const email = emailMatch ? emailMatch[0] : null;
                const textBeforeEmail = email ? footer.copyright.split(email)[0].trimEnd() : footer.copyright;
                return (
                  <>
                    <span>{textBeforeEmail}</span>
                    {email && (
                      <a href={`mailto:${email}`} className="hover:text-primary underline">
                        {email}
                      </a>
                    )}
                  </>
                );
              })()}
            </div>

            {footer.agreement && (
              <ul className="flex justify-center gap-4 lg:justify-start">
                {footer.agreement.items?.map((item, i) => (
                  <li key={i} className="hover:text-primary">
                    <a href={item.url} target={item.target}>
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </footer>
      </div>
    </section>
  );
}
