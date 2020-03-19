import React, {Component} from 'react';
import {Chart} from "react-charts";
import axios from 'axios';
import {CircularProgress, Select} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";


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
      selectedCountry: 157,
      axes: [
        {primary: true, type: 'ordinal', position: 'bottom'},
        {type: 'linear', position: 'left'}
      ],
    }
  }

  componentDidMount() {
    let confirmedJson, recoveredJson, deathsJson
    let currentData = this.state.currentData;
    axios.get("../COVID-19/confirmed.json").then(result => {
      confirmedJson = result.data.slice();
      currentData.push({label: result.data[157].label + '_confirmed', data: result.data[157].data});
      let countries = this.getCountries(result.data);
      this.setState({countries});
      axios.get("../COVID-19/recovered.json").then(result => {
        recoveredJson = result.data.slice();
        currentData.push({label: result.data[157].label + '_recovered', data: result.data[157].data});
        axios.get("../COVID-19/deaths.json").then(result => {
          deathsJson = result.data.slice();
          currentData.push({label: result.data[157].label + '_deaths', data: result.data[157].data});
          this.setState({confirmedJson, recoveredJson, deathsJson, currentData, isLoading: false})
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
    console.log(this.state.currentData);
    let data = this.state.currentData;
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
            <Typography style={{marginLeft: '15px'}} variant={"body2"}>Appuyez sur F5 pour mettre à jour</Typography>
            <FormControl style={{margin: '15px'}}>
              <InputLabel id="demo-simple-select-label" style={{color: 'inherit'}}>Choisir un pays</InputLabel>
              <Select
                style={{minWidth: '300px', color: "inherit"}}
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={this.state.selectedCountry}
                onChange={this.handleChange}

              >
                {this.state.countries.map((element, index) => {
                  return (<MenuItem key={index} value={index} color={'inherit'}>{element}</MenuItem>)
                })}

              </Select>
            </FormControl>
          </div>
          <div>{this.generateGlobalData()}</div>

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
            maxWidth: window.innerWidth + "px",
            height: '90%'
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
        <CircularProgress size={150} thickness={2} color={'inherit'}/>
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
    return (<div style={{display: 'flex'}}>
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
      <div style={{display: 'flex', flex: '1 1 auto'}}></div>
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
    if (navigator.languages != undefined)
      return navigator.languages[0];
    else
      return navigator.language
  }

  getConfirmedGlobal() {
    let count = 0;
    this.state.confirmedJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    console.log(count);
    return count;
  }

  getRecoverGlobal() {
    let count = 0;
    this.state.recoveredJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    console.log(count);
    return count;
  }

  getDeathGlobal() {
    let count = 0;
    this.state.deathsJson.forEach(element => {
      count += element.data[element.data.length - 1][1];
    });

    console.log(count);
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