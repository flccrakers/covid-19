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
      aggregateCountryList: [],
      currentCountries: [],
      currentData: [],
      selectedCountry: 'France / France',
      previousSelectedCountry: 'France / France',
      aggregateCountries: false,
      data: {},
      aggregateData: {},
      axes: [
        {primary: true, type: 'ordinal', position: 'bottom'},
        {type: 'linear', position: 'left'}
      ],
    }
  }

  componentDidMount() {
    this.loadJsonFiles(this.state.aggregateCountries);
  }


  loadJsonFiles() {
    axios.get('../COVID-19/data.json').then(result => {
      let data = result.data;
      let countries = Object.keys(data).sort();
      axios.get('../COVID-19/aggregate_data.json').then(aggregateResult => {
        let aggregateData = aggregateResult.data;
        let aggregateCountryList = Object.keys(aggregateData).sort();
        this.setState({
          countries,
          currentCountries: countries,
          aggregateCountryList,
          data,
          aggregateData,
          isLoading: false,
          currentData: this.generateCurrentData('France / France', data)
        })

      });

    });
  }

  generateCurrentData(country, data) {
    let jsonData = data[country];
    let currentData = [];
    let confirmed = [];
    let deaths = [];
    let recovered = [];
    jsonData.forEach(element => {
      confirmed.push([element.date, element.confirmed]);
      deaths.push([element.date, element.deaths]);
      recovered.push([element.date, element.recovered]);

    });
    currentData = [
      {label: country + ' confirmed', data: confirmed},
      {label: country + ' deaths', data: deaths},
      {label: country + ' recovered', data: recovered},
    ];
    return currentData;

    // let files = ['../COVID-19/confirmed.json', '../COVID-19/recovered.json', '../COVID-19/deaths.json'];
    // let aggregateFiles = ['../COVID-19/aggregate_confirmed.json', '../COVID-19/aggregate_recovered.json', '../COVID-19/aggregate_deaths.json'];
    // let filesToProcess = [];
    // let countries = [];
    // if (aggregate === true) {
    //   filesToProcess = aggregateFiles
    // } else {
    //   filesToProcess = files
    // }
    // // console.log(filesToProcess);
    // let confirmedJson, recoveredJson, deathsJson;
    // axios.get(filesToProcess[0]).then(result => {
    //   confirmedJson = result.data.slice();
    //   // console.log(confirmedJson[48]);
    //   // console.log(confirmedJson[48].data[confirmedJson[105].data.length-1]);
    //   countries = this.getCountries(result.data);
    //   let countryIndex = this.state.selectedCountry;
    //   if (countryIndex > countries.length) {
    //     countryIndex = 100
    //   }
    //   this.setState({countries, selectedCountry: countryIndex});
    //   axios.get(filesToProcess[1]).then(result => {
    //     recoveredJson = result.data.slice();
    //     axios.get(filesToProcess[2]).then(result => {
    //       deathsJson = result.data.slice();
    //       this.setState({confirmedJson, recoveredJson, deathsJson, isLoading: false});
    //       setTimeout(() => {
    //         this.setState({currentData: this.generateCurrentData(countryIndex)})
    //       }, 100)
    //     });
    //   });
    // });


  }

  render() {
    let selectedCountry = this.state.selectedCountry;

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
                  {this.state.currentCountries.map((element, index) => {
                    return (<MenuItem key={index} value={element} color={'inherit'}>{element}</MenuItem>)
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
          <Chart data={this.state.currentData} axes={this.state.axes} tooltip dark/>
        </div>
      </div>
    )
  }

  handleChange = event => {
    this.setState({
      selectedCountry: event.target.value,
      currentData: this.generateCurrentData(event.target.value, this.state.aggregateCountries === true ? this.state.aggregateData : this.state.data)
    })
  };

  handleRefresh = event => {
    this.setState({currentData: this.generateCurrentData(this.state.selectedCountry, this.state.aggregateCountries === true ? this.state.aggregateData : this.state.data)})
  };

  handleChangeAggregate = event => {
    let selectedCountry = this.state.selectedCountry;
    let currentCountries = this.state.currentCountries;
    let previousSelectedCountry = this.state.previousSelectedCountry;
    if (selectedCountry.includes(' / ') === true && event.target.checked === true) {
      previousSelectedCountry = selectedCountry;
      selectedCountry = selectedCountry.split(' / ')[0];
      currentCountries = this.state.aggregateCountryList;

    } else {
      currentCountries = this.state.countries;
      selectedCountry = this.state.previousSelectedCountry
    }
    this.setState({
      selectedCountry,
      previousSelectedCountry,
      currentCountries,
      aggregateCountries: event.target.checked,
      currentData: this.generateCurrentData(selectedCountry, event.target.checked === true ? this.state.aggregateData : this.state.data)
    });
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
      color: '#42b4e9',
      alignItems: 'center',
      flexDirection: 'column',
      margin: "0 8px",
      border: '1px solid grey',
      borderRadius: '5px',
      padding: '8px'
    };
    let boxStyleGreen = {...boxStyleRed, color: '#e0d56a'};
    let boxStyleWhite = {...boxStyleRed, color: '#fb8283'};
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

  getDataForGlobal() {
    let jsonData = this.state.data;
    if (this.state.aggregateCountries === true) {
      jsonData = this.state.aggregateData;
    }
    return jsonData[jsonData.length - 1]
  }

  getConfirmedGlobal() {
    let jsonData = this.state.data;
    let count = 0;
    Object.keys(jsonData).forEach(country => {
      count += jsonData[country][jsonData[country].length - 1].confirmed
    });

    return count;
  }

  getRecoverGlobal() {
    let jsonData = this.state.data;
    let count = 0;
    Object.keys(jsonData).forEach(country => {
      count += jsonData[country][jsonData[country].length - 1].recovered
    });


    return count;
  }

  getDeathGlobal() {
    let jsonData = this.state.data;
    let count = 0;
    Object.keys(jsonData).forEach(country => {
      count += jsonData[country][jsonData[country].length - 1].deaths
    });


    return count;
  }

  getDataForSelected() {
    let jsonData = this.state.data[this.state.selectedCountry];
    if (this.state.aggregateCountries === true) {
      jsonData = this.state.aggregateData[this.state.selectedCountry];
    }
    return jsonData[jsonData.length - 1]
  }

  getConfirmedSelected() {
    return this.getDataForSelected().confirmed;
  }

  getRecoverSelected() {
    return this.getDataForSelected().recovered;

  }

  getDeathSelected() {
    return this.getDataForSelected().deaths;
  }

}

export default Main