import ReactType from "react";
import ReactDomType from "react";

const React: typeof ReactType = Spicetify.React;
const ReactDOM: typeof ReactDomType = Spicetify.ReactDOM;

export function render() {
  return <Grid title="My Custom App!"></Grid>;
}

class Grid extends React.Component<{ title: string }, { foo: string, data: string }> {
  state = {
    foo: "bar",
    data: "etc"
  };

  render() {
    return <>
      <section className="contentSpacing">
        <div className="marketplace-header">
          <h1>{this.props.title}</h1>
        </div>
      </section>
      <div id="marketplace-grid" className="main-gridContainer-gridContainer">
        Side
      </div>
      <footer style={{margin: "auto", textAlign: "center"}}>
        Bottom
      </footer>
    </>
  }
}