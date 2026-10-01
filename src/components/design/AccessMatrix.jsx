// The role-by-action access matrix, drawn from data so it stays sharp and readable
// at any width. Cell values: "full", "cond" (with a note) or "none".
const MARK = { full: '✓', cond: '~', none: '–' };
const SAY = { full: 'Full access', cond: 'Conditional', none: 'No access' };

export default function AccessMatrix({ data }) {
  if (!data?.roles?.length) return null;
  const { roles, groups = [] } = data;
  return (
    <div className="dz-matrix-wrap">
      <div className="dz-matrix-scroll" tabIndex={0} aria-label="Access matrix, scrolls sideways on small screens">
        <table className="dz-matrix">
          <thead>
            <tr>
              <th scope="col">Action</th>
              {roles.map((r) => (
                <th scope="col" key={r}>
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g.name}>
              <tr className="dz-matrix-group">
                <th colSpan={roles.length + 1} scope="colgroup">
                  {g.name}
                </th>
              </tr>
              {g.rows.map((row) => (
                <tr key={row.action}>
                  <th scope="row">{row.action}</th>
                  {row.cells.map((c, i) => {
                    const cell = typeof c === 'string' ? { v: c } : c;
                    return (
                      <td key={i} className={`is-${cell.v}`}>
                        <span className="dz-mark" aria-label={SAY[cell.v]}>
                          {MARK[cell.v]}
                        </span>
                        {cell.note && <span className="dz-cell-note">{cell.note}</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <div className="dz-matrix-key">
        <span>
          <span className="dz-mark is-full">✓</span> Full access
        </span>
        <span>
          <span className="dz-mark is-cond">~</span> Conditional
        </span>
        <span>
          <span className="dz-mark is-none">–</span> No access
        </span>
      </div>
    </div>
  );
}
