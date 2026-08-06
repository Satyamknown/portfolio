// Renders **bold** spans without reaching for dangerouslySetInnerHTML.
export default function Inline({ children }) {
  const parts = String(children || '').split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}
