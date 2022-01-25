import {React, ReactDOM} from '../index'
import './css/global.scss'
import styles from './css/app.module.scss'

class App extends React.Component<{}, {}> {
  render() {
    return <label title={"My Custom App!"}></label>;
  }
}

export default App;
