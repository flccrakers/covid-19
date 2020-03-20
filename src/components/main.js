import React, {Component} from 'react';
import {Chart} from "react-charts";
import axios from 'axios';
import {Checkbox, CircularProgress, Select} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Refresh from '@material-ui/icons/Sync';
import FormControlLabel from "@material-ui/core/FormControlLabel";


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
      selectedCountry: 100,
      aggregateCountries: false,
      axes: [
        {primary: true, type: 'ordinal', position: 'bottom'},
        {type: 'linear', position: 'left'}
      ],
    }
  }

  componentDidMount() {
    this.loadJsonFiles(this.state.aggregateCountries);
  }

  loadJsonFiles(aggregate) {
    let files = ['../COVID-19/confirmed.json', '../COVID-19/recovered.json', '../COVID-19/deaths.json'];
    let aggregateFiles = ['../COVID-19/aggregate_confirmed.json', '../COVID-19/aggregate_recovered.json', '../COVID-19/aggregate_deaths.json'];
    let filesToProcess = [];
    let countries = [];
    if (aggregate === true) {
      filesToProcess.concat(aggregateFiles)
    } else {
      filesToProcess.concat(files)
    }
    console.log(filesToProcess);
    let confirmedJson, recoveredJson, deathsJson;
    axios.get(filesToProcess[0]).then(result => {
      confirmedJson = result.data.slice();
      countries = this.getCountries(result.data);
      let countryIndex = this.state.selectedCountry;
      if (countryIndex > countries.length) {
        countryIndex = 100
      }
      this.setState({countries, selectedCountry: countryIndex});
      axios.get(filesToProcess[1]).then(result => {
        recoveredJson = result.data.slice();
        axios.get(filesToProcess[2]).then(result => {
          deathsJson = result.data.slice();
          this.setState({confirmedJson, recoveredJson, deathsJson, isLoading: false});
          setTimeout(() => {
            this.setState({currentData: this.generateCurrentData(countryIndex)})
          }, 100)
        });
      });
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
    let data = this.state.currentData;
    let selectedCountry = this.state.selectedCountry;

    if (selectedCountry > this.state.countries.length) {
      selectedCountry = 0
    }

    if (this.state.isLoading === true) {
      return this.getLoading();
    }
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        maxWidth: window.innerWidth + "px",

      }}>
        <div style={{
          display: 'flex',
          flex: '1 1 auto',
          backgroundColor: 'rgba(42, 42, 42, 0.9)',
          padding: '5px',
          margin: '8px',
          borderRadius: '5px',
        }}>
          <div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <Typography style={{marginLeft: '15px'}} variant={"body2"}>Hit F5 to reload</Typography>
              <IconButton aria-label="delete" color={'inherit'} onClick={this.handleRefresh}>
                <Refresh/>
              </IconButton>
            </div>
            <div style={{display: 'flex', flexDirection: 'column'}}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.aggregateCountries}
                    onChange={this.handleChangeAggregate}
                    name="AggregateCountries"
                    color="primary"
                  />
                }
                label="Aggregate Countries"
                style={{marginLeft: '5px'}}
              />
              <FormControl style={{margin: '15px'}}>
                <InputLabel id="demo-simple-select-label" style={{color: 'inherit'}}>Select a country</InputLabel>
                <Select
                  style={{minWidth: '300px', color: "inherit"}}
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedCountry}
                  onChange={this.handleChange}

                >
                  {this.state.countries.map((element, index) => {
                    return (<MenuItem key={index} value={index} color={'inherit'}>{element}</MenuItem>)
                  })}

                </Select>
              </FormControl>
            </div>
          </div>
          <div style={{display: 'flex', flex: '1 1 auto'}}>{this.generateGlobalData()}</div>

        </div>
        <div style={{backgroundColor: 'rgba(42, 42, 42, 0.9)', padding: '5px', margin: '8px', borderRadius: '5px',}}>
          <Typography style={{marginLeft: '15px'}} variant={"body2"}>Based on the Coronavirus COVID-19 Global Cases by
            the Center for Systems Science
            and Engineering (CSSE) at Johns Hopkins University (JHU) <a
              href={'https://gisanddata.maps.arcgis.com/apps/opsdashboard/index.html#/bda7594740fd40299423467b48e9ecf6'}
              target={'blank'}>website</a></Typography>
        </div>

        <div
          style={{
            display: 'flex',
            margin: '8px',
            flex: '1 1 auto',
            background: 'rgba(42, 42, 42, 0.9)',
            padding: '.5rem',
            borderRadius: '5px',
            maxWidth: (window.innerWidth - 25) + "px",
            maxHeight: (window.innerWidth - 186) + "px",
            // height: '90%'
          }}
        >
          <Chart data={data} axes={this.state.axes} tooltip dark/>
        </div>
      </div>
    )
  }

  handleChange = event => {
    this.setState({selectedCountry: event.target.value, currentData: this.generateCurrentData(event.target.value)})
  };

  handleRefresh = event => {
    this.setState({currentData: this.generateCurrentData(this.state.selectedCountry)})
  };

  handleChangeAggregate = event => {
    this.setState({aggregateCountries: event.target.checked});
    this.loadJsonFiles(event.target.checked);
  };

  getLoading() {
    return (
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#3c3c3c',
        flexDirection: 'column'
      }}>
        <CircularProgress size={150} thickness={2} color={"primary"}/>
        <Typography style={{marginTop: '15px'}} variant={"h5"}>Loading...</Typography>
      </div>
    );
  }

  generateGlobalData() {
    let language = this.getLanguage();
    let boxStyleRed = {
      display: 'flex',
      color: 'red',
      alignItems: 'center',
      flexDirection: 'column',
      margin: "0 8px",
      border: '1px solid grey',
      borderRadius: '5px',
      padding: '8px'
    };
    let boxStyleGreen = {...boxStyleRed, color: 'green'};
    let boxStyleWhite = {...boxStyleRed, color: '#fff'};
    return (<div style={{display: 'flex', flex: '1 1 auto'}}>
      <div style={boxStyleRed}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Local confirmed</Typography>
        <Typography variant={"h2"}>{this.getConfirmedSelected().toLocaleString(language)}</Typography>
      </div>
      <div style={boxStyleGreen}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Local recovered</Typography>
        <Typography variant={"h2"}>{this.getRecoverSelected().toLocaleString(language)}</Typography>
      </div>
      <div style={boxStyleWhite}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Local death</Typography>
        <Typography variant={"h2"}>{this.getDeathSelected().toLocaleString(language)}</Typography>
      </div>
      <div style={{display: 'flex', flex: '1 1 auto'}}/>
      <div style={boxStyleRed}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Total confirmed</Typography>
        <Typography variant={"h2"}>{this.getConfirmedGlobal().toLocaleString(language)}</Typography>
      </div>
      <div style={boxStyleGreen}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Total recovered</Typography>
        <Typography variant={"h2"}>{this.getRecoverGlobal().toLocaleString(language)}</Typography>
      </div>
      <div style={boxStyleWhite}>
        <Typography variant={"h6"} style={{color: '#fff'}}>Total death</Typography>
        <Typography variant={"h2"}>{this.getDeathGlobal().toLocaleString(language)}</Typography>
      </div>

    </div>)
  }

  getLanguage() {
    if (navigator.languages !== undefined)
      return navigator.languages[0];
    else
      return navigator.language
  }

  getConfirmedGlobal() {
    let count = 0;
    this.state.confirmedJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    return count;
  }

  getRecoverGlobal() {
    let count = 0;
    this.state.recoveredJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    return count;
  }

  getDeathGlobal() {
    let count = 0;
    this.state.deathsJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    return count;
  }

  getConfirmedSelected() {
    let length = this.state.confirmedJson[this.state.selectedCountry].data.length;
    return this.state.confirmedJson[this.state.selectedCountry].data[length - 1][1]
  }

  getRecoverSelected() {
    let length = this.state.recoveredJson[this.state.selectedCountry].data.length;
    return this.state.recoveredJson[this.state.selectedCountry].data[length - 1][1]

  }

  getDeathSelected() {
    let length = this.state.deathsJson[this.state.selectedCountry].data.length;
    return this.state.deathsJson[this.state.selectedCountry].data[length - 1][1]
  }

}

export default Main