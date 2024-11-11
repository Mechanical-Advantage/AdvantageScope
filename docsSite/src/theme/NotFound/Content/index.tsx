import Heading from "@theme/Heading";
import type { Props } from "@theme/NotFound/Content";
import clsx from "clsx";
import Image404 from "./404.webp";

export default function NotFoundContent({ className }: Props): JSX.Element {
  return (
    <main className={clsx("container margin-vert--xl", className)}>
      <div className="row">
        <div className="col col--6 col--offset-3">
          <Heading as="h1" className="hero__title">
            You've Lost Your Way!
          </Heading>
          <p>
            The page you were looking for doesn't exist. If you clicked on a link from another site, let the authors
            know that their link is broken!
          </p>
          <p>
            Try navigating to the <a href="/">homepage</a> and see if you can find what you're looking for there.
          </p>
          <p>
            <img src={Image404} height="250" />
          </p>
        </div>
      </div>
    </main>
  );
}
