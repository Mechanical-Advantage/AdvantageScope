import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import isInternalUrl from "@docusaurus/isInternalUrl";
import { findFirstSidebarItemLink, useDocById } from "@docusaurus/plugin-content-docs/client";
import { usePluralForm } from "@docusaurus/theme-common";
import clsx from "clsx";
import { type ReactNode } from "react";

import type { PropSidebarItemCategory, PropSidebarItemLink } from "@docusaurus/plugin-content-docs";
import type { Props } from "@theme/DocCard";
import Heading from "@theme/Heading";

import styles from "./styles.module.css";

function useCategoryItemsPlural() {
  const { selectMessage } = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          message: "1 item|{count} items",
          id: "theme.docs.DocCard.categoryDescription.plurals",
          description:
            "The default description for a category card in the generated index about how many items this category includes"
        },
        { count }
      )
    );
}

function CardContainer({ href, children }: { href: string; children: ReactNode }): JSX.Element {
  return (
    <Link href={href} className={clsx("card padding--lg", styles.cardContainer)}>
      {children}
    </Link>
  );
}

function CardLayout({ href, title }: { href: string; title: string }): JSX.Element {
  return (
    <CardContainer href={href}>
      <Heading as="h2" className={clsx("text--truncate", styles.cardTitle)} title={title}>
        {title}
      </Heading>
    </CardContainer>
  );
}

function CardCategory({ item }: { item: PropSidebarItemCategory }): JSX.Element | null {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();

  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }

  return <CardLayout href={href} title={item.label} />;
}

function CardLink({ item }: { item: PropSidebarItemLink }): JSX.Element {
  const icon = isInternalUrl(item.href) ? "📄️" : "🔗";
  const doc = useDocById(item.docId ?? undefined);
  return <CardLayout href={item.href} title={item.label} />;
}

export default function DocCard({ item }: Props): JSX.Element {
  switch (item.type) {
    case "link":
      return <CardLink item={item} />;
    case "category":
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
