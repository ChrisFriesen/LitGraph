import React from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import './index.css';

require('highcharts/modules/networkgraph')(Highcharts);
require('highcharts/modules/no-data-to-display')(Highcharts);
require('highcharts/modules/annotations')(Highcharts);


// General options for the litGraph
var options = {
  chart: {
    type: 'networkgraph',
    height: '100%'
  },
  title: {
    text: 'Literature Citation Graph'
  },
  plotOptions: {
      networkgraph: {
          keys: ['from', 'to'],
          layoutAlgorithm: {
              enableSimulation: true,
              friction: -0.9
          }
      }
  },
  lang: {
      noData: "No data to display, use the form below"
  },
  noData: {
      style: {
          fontWeight: 'bold',
          fontSize: '15px',
          color: '#303030'
      }
  },
  series: [{
        dataLabels: {
            enabled: false,
            linkFormat: ''
        },
        id: 'litGraph',
        data: [],
  }],
}


class LiteratureGraphing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chartOptions: options,
      bibliography: '',
      citingPaper: '',
      hasQuotes: false,
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.parseBibliography = this.parseBibliography.bind(this);
  }

  handleChange(e) {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    this.setState({ 
      [name]: value 
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.bibliography.length) {
      return;
    }

    var papers;
    var data = this.state.chartOptions.series[0].data;

    if (this.state.hasQuotes) {
      papers = this.parseBibliographyQuotes();
    } else {
      papers = this.parseBibliography();
    }

    this.cleanPaperNames(papers);

    for (var i = 0; i < papers.length; i++) {
      var newRelation = [this.state.citingPaper.toLowerCase(), papers[i]];
      data.push(newRelation);
    }

    this.setState(prevState => ({
      chartOptions: {
        series: [{
          dataLabels: {
              enabled: false,
              linkFormat: ''
          },
          id: 'litGraph',
          data: data
        }]
      }
    }));
  }

  parseBibliographyQuotes() {
    var papers = [];
    var splitBiblio = this.state.bibliography.split("\“");

    /* i begins at 1 as the first title will be at array[1] since
     * we're spliting on "
     */
    for (var i = 1; i < splitBiblio.length; i++) {
      var end = splitBiblio[i].indexOf("”");
      var paper = splitBiblio[i].slice(0, end);
      papers.push(paper.slice(0, paper.length - 1));
    }

    return papers;
  }

  parseBibliography() {
    var papers = [];
    var splitBiblio = this.state.bibliography.split("]");

    /* i begins at 1 as the first title will be at array[1] since
     * we're spliting on ]
     */
    for (var i = 1; i < splitBiblio.length; i++) {
      var prePeriod = 0;
      var start = null;

      for (var j = 0; j < splitBiblio[i].length; j++) {

        if (splitBiblio[i][j] === '.') {
          if (prePeriod > 1 && start === null) {
            start = j + 2;
          } else if (prePeriod > 1) {
            papers.push(splitBiblio[i].slice(start, j));
            break;
          }

          prePeriod = 0;
        }

        if (splitBiblio[i][j].match(/\s/)) {
          prePeriod = 0;
        } else if (splitBiblio[i][j].match(/^[a-zA-Z]*$/)) {
          prePeriod++;
        }
      }
    }

    return papers;
  }

  cleanPaperNames(papers) {
    for (var i = 0; i < papers.length; i++) {
      papers[i] = papers[i].replace(/\n/g, " ").toLowerCase();
    }
  }

  render() {
    return (
      <div>
        <LitGraph 
          value={this.state.chartOptions}
        />
        <form id='data-form' onSubmit={this.handleSubmit}>
          <label htmlFor='citing-paper'>
            Enter the paper name:
            <br />
            <input
              id='citing-paper'
              name='citingPaper'
              type='text'
              onChange={this.handleChange}
              value={this.state.citingPaper}
          />
          </label>
          <br />
          <label htmlFor='bibliography'>
            Paste an IEEE formatted bibliography here:
            <br />
            <textarea
              id='bibliography'
              name='bibliography'
              rows='20'
              cols='60'
              onChange={this.handleChange}
              value={this.state.bibliography}
            />
          </label>
          <br />
          <label htmlFor='has-quotes'>
            Has quotes around paper titles
            <input
              id='has-quotes'
              name='hasQuotes'
              type='checkbox'
              checked={this.state.hasQuotes}
              onChange={this.handleChange} />
          </label>
          <br />
          <br />
          <button>
            Add paper citations
          </button>
        </form>
        <br />
      </div>
    );
  }
}

class LitGraph extends React.Component {

  render() {
    return (
      <div id='litGraph-container'>
        <HighchartsReact 
          highcharts={Highcharts}
          options={this.props.value}
        />
      </div>
    )
  }
}


// ========================================

ReactDOM.render(
  <LiteratureGraphing />,
  document.getElementById('root')
);

