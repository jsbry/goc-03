import Markdown from "react-markdown";

function Main() {
  const content = "# H1\n## H2\n### H3\n\nThis is a sample markdown content.";

  return <Markdown>{content}</Markdown>;
}

export default Main;
