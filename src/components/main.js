import React, {Component} from 'react';
import {Chart} from "react-charts";
import axios from 'axios';
import {Select} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";


const data_origin = [
  {
    label: 'Series 1',
    data: [["1/22/20", 0], ["1/23/20", 0], ["1/24/20", 2], ["1/25/20", 3], ["1/26/20", 3]]
  },
  {
    label: 'Series 2',
    data: [['02/03/20', 3], ['03/03/20', 1], ['04/03/20', 5], ['05/03/20', 6], ['06/03/20', 4]]
  }
];

const axes = [
  {primary: true, type: 'ordinal', position: 'bottom'},
  {type: 'linear', position: 'left'}
];

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      confirmedJson: undefined,
      deathsJson: undefined,
      recoveredJson: undefined,
      isLoading: true,
      countries: [],
      currentData: [],
      selectedCountry: 157
    }
  }

  componentDidMount() {
    axios.get("../COVID-19/confirmed.json").then(result => {
      // console.log(result.data);
      let currentData = this.state.currentData;
      currentData.push({label: result.data[157].label + '_confirmed', data: result.data[157].data});
      let countries = this.getCountries(result.data);
      this.setState({confirmedJson: result.data, currentData, countries})

    });
    axios.get("../COVID-19/recovered.json").then(result => {
      // console.log(result.data);
      let currentData = this.state.currentData;
      currentData.push({label: result.data[157].label + '_recovered', data: result.data[157].data});
      this.setState({recoveredJson: result.data, currentData})
    });
    axios.get("../COVID-19/deaths.json").then(result => {
      // console.log(result.data);
      let currentData = this.state.currentData;
      currentData.push({label: result.data[157].label + '_deaths', data: result.data[157].data});
      this.setState({deathsJson: result.data, currentData, isLoading: false})
    });
  }

  getCountries(data) {
    let countries = [];
    data.forEach(element => {
      countries.push(element.label);
    });
    return countries
  }

  generateCurrentData(index) {
    let currentData = [];
    let confirmed = this.state.confirmedJson[index];
    let deaths = this.state.deathsJson[index];
    let recovered = this.state.recoveredJson[index];
    currentData = [
      {label: confirmed.label + '_confirmed', data: confirmed.data},
      {label: deaths.label + '_deaths', data: deaths.data},
      {label: recovered.label + '_recovered', data: recovered.data},
    ];
    return currentData;

  }

  render() {
    console.log(this.state.currentData);
    let data = this.state.currentData;
    if (this.state.isLoading === true) {
      return (<div>loading</div>);
    }
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        maxWidth: window.innerWidth - 50 + "px"
      }}>
        <FormControl style={{margin: '15px', maxWidth: '300px'}}>
          <InputLabel id="demo-simple-select-label">Choisir un pays</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={this.state.selectedCountry}
            onChange={this.handleChange}
          >
            {this.state.countries.map((element, index) => {
              return (<MenuItem value={index}>{element}</MenuItem>)
            })}

          </Select>
        </FormControl>

        <div
          style={{
            display: 'flex',
            margin: '20px',
            flex: '1 1 auto',
            background: 'rgba(0, 27, 45, 0.9)',
            padding: '.5rem',
            borderRadius: '5px',
            width: '100%',
            height: '90%'
          }}
        >
          <Chart data={data} axes={axes} tooltip dark/>
        </div>
      </div>
    )
  }

  handleChange = event => {
    this.setState({selectedCountry: event.target.value, currentData: this.generateCurrentData(event.target.value)})
  }
}

export default Main