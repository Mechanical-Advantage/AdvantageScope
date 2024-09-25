import { filterDocCardListItems, useCurrentSidebarCategory } from "@docusaurus/plugin-content-docs/client";
import DocCard from "@theme/DocCard";
import type { Props } from "@theme/DocCardList";
import clsx from "clsx";

function DocCardListForCurrentSidebarCategory({ className }: Props) {
  const category = useCurrentSidebarCategory();
  return <DocCardList items={category.items} className={className} />;
}

export default function DocCardList(props: Props): JSX.Element {
  const { items, className } = props;
  if (!items) {
    return <DocCardListForCurrentSidebarCategory {...props} />;
  }
  const filteredItems = filterDocCardListItems(items);
  return (
    <section className={clsx("row", className)}>
      {filteredItems.map((item, index) => (
        <article key={index} className="col col--6 margin-bottom--lg">
          <DocCard item={item} />
        </article>
      ))}
    </section>
  );
}
