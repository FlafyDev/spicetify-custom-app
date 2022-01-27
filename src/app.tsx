import './css/global.scss'
import styles from './css/app.module.scss'
import React from 'react'

class App extends React.Component<{}, {count: number, showConfetti: boolean}> {
  state = {
    count: 0,
    showConfetti: false,
  };

  stopConfettiTimeout: NodeJS.Timeout | null = null;

  onButtonClick = () => {
    this.setState((state) => {
      return {
        count: state.count+1,
        showConfetti: true,
      }
    });

    if (this.stopConfettiTimeout) {
      clearTimeout(this.stopConfettiTimeout)
      this.stopConfettiTimeout = null
    }

    this.stopConfettiTimeout = setTimeout(() => {
      this.setState({
        showConfetti: false,
      });
    }, 1000);
  }

  render() {
    return <>
      <div className={styles.container}>
        <div className={styles.title}>{"My Custom App!"}</div>
        <button className={styles.button} onClick={this.onButtonClick}>{"Count up"}</button>
        <div className={styles.counter}>{this.state.count}</div>
      </div>
    </>
  } 
}

export default App;
