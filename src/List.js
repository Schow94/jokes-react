import React, { Component } from 'react';
import axios from 'axios';
import Joke from './Joke';
import './List.css';

const BASE_URL = 'https://icanhazdadjoke.com/';

export default class List extends Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem('jokes') || '[]'),
      loading: false
    };
    this.seenJokes = new Set(this.state.jokes.map(j => j.id));
    console.log('from constructor', this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      let jokes = [];
      while (jokes.length < 2) {
        let res = await axios.get(BASE_URL, {
          headers: { Accept: 'application/json' }
        });

        let newJoke = res.data;

        let isUnique = this.seenJokes.has(newJoke.id);

        if (!isUnique) {
          this.seenJokes.add(newJoke.id);

          jokes.push({ text: newJoke.joke, id: newJoke.id, votes: 0 });
          // console.log(this.state.jokes);
          // console.log('from getJokes()', this.seenJokes);
          // console.log(this.state.jokes);
          //this code always runs for some reason - problem in this code ^^^
        } else {
          console.log('FOUND A DUPLICATE');
          console.log(newJoke);
          //never reaches this code for some reason
        }

        this.setState(
          st => ({
            loading: false,
            jokes: [...st.jokes, ...jokes]
          }),
          () =>
            window.localStorage.setItem(
              'jokes',
              JSON.stringify(this.state.jokes)
            )
        );
      }
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  }

  handleVote(id, delta) {
    this.setState(
      st => ({
        jokes: st.jokes.map(j =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        )
      }),
      () =>
        window.localStorage.setItem('jokes', JSON.stringify(this.state.jokes))
    );
  }

  handleClick() {
    this.setState({ loading: true }, this.getJokes);
    // console.log(this.state.jokes);
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="far fa-8x fa-laugh fa-spin" />
          <h1 className="JokeList-title">Loading...</h1>
        </div>
      );
    }

    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);

    return (
      <div className="JokeList">
        <div className="JokeList-sidebar">
          <h1 className="JokeList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            alt="icons"
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
          />
          <button onClick={this.handleClick} className="JokeList-getmore">
            Fetch Jokes
          </button>
        </div>
        <div className="JokeList-jokes">
          {jokes.map(j => (
            <Joke
              upVote={() => this.handleVote(j.id, 1)}
              downVote={() => this.handleVote(j.id, -1)}
              votes={j.votes}
              text={j.text}
              jokes={this.state.jokes}
            />
          ))}
        </div>
      </div>
    );
  }
}
