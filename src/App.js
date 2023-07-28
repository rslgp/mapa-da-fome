import React, { Component } from 'react';
import './App.css';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import Header from './components/header';

import InserirEndereco from './components/googlesheets/endereco';
import MyLocationButton from './components/googlesheets/mylocation';
import Sugestao from './components/googlesheets/sugestao';

import CoffeeMap from './components/map.js';
// import CoffeeTable from './components/table';
import ReactGA from 'react-ga';
import CircularProgress from '@mui/material/CircularProgress';
import { Checkbox } from '@mui/material';

//call to action content creators
import CreatorsMapaFome from './components/CreatorsMapaFome.js'

import envVariables from './components/variaveisAmbiente';

import qr from './images/qr.svg';

// Material-UI
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import CleanOld from './components/googlesheets/cleanold';


import coffeeBean from './images/bean.svg';
import hub from './images/hub.svg';
import green from './images/green.svg';
import red from './images/red.svg';
import insta from './images/insta.svg';

import AesEncryption from "aes-encryption";

import Cookies from 'universal-cookie';
 
const cookies = new Cookies();
const EXPIRE_DAY = 7;

const aes = new AesEncryption();

// Google Analytics
function initializeReactGA() {
  ReactGA.initialize('UA-172868315-1');
  ReactGA.pageview(window.location.pathname + window.location.search);
}

initializeReactGA();

aes.setSecretKey(process.env.REACT_APP_CRYPTSEED+"F");

const { GoogleSpreadsheet } = require('google-spreadsheet');

// Google Sheets Document ID -- PROD
const doc = new GoogleSpreadsheet(process.env.REACT_APP_GOOGLESHEETID);

// Google Sheets Document ID -- DEV
// const doc = new GoogleSpreadsheet('1jQI6PstbEArW_3xDnGgPJR6_37r_KjLoa765bOgMBhk');

// Provider for leaflet-geosearch plugin
const provider = new OpenStreetMapProvider();
//limit osm https://operations.osmfoundation.org/policies/nominatim/




class App extends Component {

  // Initial state
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      dataMaps: [],
      dataHeader: [{ label: "Índice" }, { label: "Lugar" }],
      rowCount: '',
      center:[-8.0671132,-34.8766719],
      alimento:'Alimento pronto',
      telefone:'',
      telefoneEncryptado:'',
      diaSemana:'',
      horario:'',
      mes:'',
      filtro:"Todos",
      lastMarkedCoords:[],
      numero:'',
      telefoneFilterLocal:false,
      site:'',
      redesocial:'',

    }

    this.dropDownMenuSemanaEntregaAlimentoPronto = React.createRef();
    this.dropDownMenuHorarioEntregaAlimentoPronto = React.createRef();
    this.dropDownMenuSemanaPrecisandoBuscar = React.createRef();
    this.dropDownMenuHorarioPrecisandoBuscar = React.createRef();
    this.dropDownMenuFiltro = React.createRef();
    this.redesocialRef = React.createRef();
    this.dropDownMenuRedeSocial = React.createRef();
    this.dropDownMenuMesPrecisandoBuscar = React.createRef();
    this.dropDownMenuMesEntregaAlimentoPronto = React.createRef();
  
    
    this.handleChangeNumero = this.handleChangeNumero.bind(this);

    this.setTipoAlimento = this.setTipoAlimento.bind(this);
    this.handleChangeTelefone = this.handleChangeTelefone.bind(this);
    this.setDiaSemana = this.setDiaSemana.bind(this);
    this.setHorario = this.setHorario.bind(this);
    this.setMes = this.setMes.bind(this);
    this.setFiltro = this.setFiltro.bind(this);
    this.removerPonto = this.removerPonto.bind(this);
    this.handleClickMap = this.handleClickMap.bind(this);
    this.telefoneFilterChange = this.telefoneFilterChange.bind(this);
    this.handleChangeRedeSocial = this.handleChangeRedeSocial.bind(this);
  }

  telefoneFilterChange(event){
    envVariables.telefoneFilter = !envVariables.telefoneFilter;
    this.setState({
      telefoneFilterLocal: envVariables.telefoneFilter
    });
  }

  removerPonto(coords, categoriaPonto){
    console.log("remover "+coords);
    let motivo = prompt("por qual motivo (em resumo) gostaria de deletar esse ponto?");
    if(motivo !== null){
      (async function main(self) {
        try{
          await doc.useServiceAccountAuth({
            client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
            });

            await doc.loadInfo(); // Loads document properties and worksheets

            const sheet = doc.sheetsByIndex[4];
            //row = { Name: "new name", Value: "new value" };
            
            const row = { Motivo: motivo, Ponto: JSON.stringify(coords), DateISO: new Date().toISOString(), CategoriaPonto:categoriaPonto};
            
            let r = await sheet.addRow(row);
            console.log(r);
          
            alert("pedido de deletar enviado com sucesso");
        }catch(e){
          alert("ERRO, tente novamente");
          //console.log(e);

        }
        
      })(motivo, coords);
    }
  }

  verificarPonto(coords, categoriaPonto){
    let motivo = prompt("Insira o CNPJ da entidade, nome da entidade, nome do responsável, email, telefone e se é credenciada para receber recurso do governo");
    if(motivo !== null){
      (async function main(self) {
        try{
          await doc.useServiceAccountAuth({
            client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
            });

            await doc.loadInfo(); // Loads document properties and worksheets

            const sheet = doc.sheetsByIndex[3];
            //row = { Name: "new name", Value: "new value" };
            
            const row = { Motivo: motivo, Ponto: JSON.stringify(coords), DateISO: new Date().toISOString(), CategoriaPonto:categoriaPonto};
            
            let r = await sheet.addRow(row);
            console.log(r);
          
            alert("pedido de cnpj enviado com sucesso");
        }catch(e){
          alert("ERRO, tente novamente");
          console.log(e);

        }
        
      })(motivo, coords);
    }
  }

  contabilizarClicado(coords){
    (async function main(self) {
      try{
        await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });

          await doc.loadInfo(); // Loads document properties and worksheets

          const sheet = doc.sheetsByIndex[0];
          //row = { Name: "new name", Value: "new value" };
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;
          coords = JSON.stringify(coords);
          let rowEncontrada = rows.filter((x) => { 
            //x.Coordinates
            //console.log(JSON.parse(x.Dados).Coordinates);
            return JSON.parse(x.Dados).Coordinates === coords; });
          
          //console.log(rowEncontrada[0].City);
          let dadosNovos = JSON.parse(rowEncontrada[0].Dados);
          if(dadosNovos.clicado) dadosNovos.clicado++;
          else dadosNovos.clicado=1;
          rowEncontrada[0].Dados = JSON.stringify(dadosNovos);
          await rowEncontrada[0].save();
          
          //window.location.reload();
      }catch(e){
        //console.log(e);

      }
      
    })(coords);
  }
  
  clicouTelefone(coords){
    (async function main(self) {
      try{
        await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });

          await doc.loadInfo(); // Loads document properties and worksheets

          const sheet = doc.sheetsByIndex[0];
          //row = { Name: "new name", Value: "new value" };
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;
          coords = JSON.stringify(coords);
          let rowEncontrada = rows.filter((x) => { 
            //x.Coordinates
            //console.log(JSON.parse(x.Dados).Coordinates);
            return JSON.parse(x.Dados).Coordinates === coords; });
          
          //console.log(rowEncontrada[0].City);
          let dadosNovos = JSON.parse(rowEncontrada[0].Dados);
          if(dadosNovos.clickTel) dadosNovos.clickTel++;
          else dadosNovos.clickTel=1;
          rowEncontrada[0].Dados = JSON.stringify(dadosNovos);
          await rowEncontrada[0].save();
          
          //window.location.reload();
      }catch(e){
        //console.log(e);

      }
      
    })(coords);
  }
  entregarAlimento(coords){
    (async function main(self) {
      try{
        await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });

          await doc.loadInfo(); // Loads document properties and worksheets

          const sheet = doc.sheetsByIndex[0];
          //row = { Name: "new name", Value: "new value" };
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;
          coords = JSON.stringify(coords);
          let rowEncontrada = rows.filter((x) => { 
            //x.Coordinates
            //console.log(JSON.parse(x.Dados).Coordinates);
            return JSON.parse(x.Dados).Coordinates === coords; });
          
          //console.log(rowEncontrada[0].City);
          let dadosNovos = JSON.parse(rowEncontrada[0].Dados);
          dadosNovos.AlimentoEntregue++;
          rowEncontrada[0].Dados = JSON.stringify(dadosNovos);
          await rowEncontrada[0].save();
          
          window.location.reload();
      }catch(e){
        //console.log(e);

      }
      
    })(coords);
  }

  avaliar(coords, avaliacao){
    
    (async function main(coords, avaliacao) {
      try{
        await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });

          await doc.loadInfo(); // Loads document properties and worksheets

          const sheet = doc.sheetsByIndex[0];
          //row = { Name: "new name", Value: "new value" };
          
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;
          coords = JSON.stringify(coords);
          let rowEncontrada = rows.filter((x) => { 
            //x.Coordinates
            console.log(JSON.parse(x.Dados).Coordinates);
            return JSON.parse(x.Dados).Coordinates===(coords); });
          
          //console.log(rowEncontrada[0].City);
          let dadosNovos = JSON.parse(rowEncontrada[0].Dados);
          if(dadosNovos.Avaliacao == undefined){
            dadosNovos.Avaliacao = {
              "1":0,
              "2":0,
              "3":0,
              "4":0,
              "5":0
            }
          }
          if(avaliacao===null)avaliacao=5;
          dadosNovos.Avaliacao[avaliacao]++;
          rowEncontrada[0].Dados = JSON.stringify(dadosNovos);
          
          let cookieName='pontosAvaliados';
          let pontos = cookies.get(cookieName) || "";
          coords = JSON.parse(coords);
          let coordsString = coords[0]+""+coords[1];
          //let pontosEntregues = JSON.parse(pontosEntreguesData);
          if(pontos.includes(coordsString)) return;

          await rowEncontrada[0].save();
          
          pontos+=coordsString;

          const cookieExpireDate = new Date();
          cookieExpireDate.setDate(cookieExpireDate.getDate() + EXPIRE_DAY);

          cookies.set(cookieName, pontos, { path: '/', expires: cookieExpireDate });
          
          window.location.reload();
      }catch(e){
        console.log(e);

      }
      
    })(coords, avaliacao);
  }

  setFiltro(event){
    this.setState({
      filtro: event.target.value
    });
  }
  setTipoAlimento(event){
    this.setState({
      alimento: event.target.value
    });
    
    let isPrecisandoBuscar = event.target.value === 'PrecisandoBuscar',
    isEntregaAlimentoPronto = event.target.value === 'EntregaAlimentoPronto',
    isDoador = event.target.value === 'Doador';

    this.dropDownMenuSemanaPrecisandoBuscar.current.style.display="none";
    this.dropDownMenuHorarioPrecisandoBuscar.current.style.display="none";
    this.dropDownMenuMesPrecisandoBuscar.current.style.display="none";
    this.dropDownMenuSemanaEntregaAlimentoPronto.current.style.display="none";
    this.dropDownMenuHorarioEntregaAlimentoPronto.current.style.display="none";
    this.dropDownMenuMesEntregaAlimentoPronto.current.style.display="none";

    if( isPrecisandoBuscar ){
      this.dropDownMenuSemanaPrecisandoBuscar.current.style.display="";
      this.dropDownMenuHorarioPrecisandoBuscar.current.style.display="";
      this.dropDownMenuMesPrecisandoBuscar.current.style.display="";
      this.setState({
        diaSemana: this.dropDownMenuSemanaPrecisandoBuscar.current.value,
        horario: this.dropDownMenuHorarioPrecisandoBuscar.current.value,
        mes: this.dropDownMenuMesPrecisandoBuscar.current.value
      });

    }else    
    if( isEntregaAlimentoPronto ){
      this.dropDownMenuSemanaEntregaAlimentoPronto.current.style.display="";
      this.dropDownMenuHorarioEntregaAlimentoPronto.current.style.display="";
      this.dropDownMenuMesEntregaAlimentoPronto.current.style.display="";
      
      this.setState({
        diaSemana: this.dropDownMenuSemanaEntregaAlimentoPronto.current.value,
        horario: this.dropDownMenuHorarioEntregaAlimentoPronto.current.value,
        mes: this.dropDownMenuMesEntregaAlimentoPronto.current.value
      });

    }
    else {
      this.setState({
        diaSemana: '',
        horario: '',
        mes: ''
      });

    }

    if(isPrecisandoBuscar || isEntregaAlimentoPronto || isDoador){
      this.redesocialRef.current.style.display="";
      this.dropDownMenuRedeSocial.current.style.display="";
    }else{
      this.redesocialRef.current.style.display="none";
      this.dropDownMenuRedeSocial.current.style.display="none";
    }

  }

  setDiaSemana(event){
    this.setState({
      diaSemana: event.target.selectedOptions[0].value
    });
    // console.log(this.dropDownMenuSemana.current.value);
    // console.log(event.target.selectedOptions[0].value);
    // console.log(this.state.diaSemana);
  }

  
  setHorario(event){
    this.setState({
      horario: event.target.selectedOptions[0].value
    });
    // console.log(this.dropDownMenuSemana.current.value);
    // console.log(event.target.selectedOptions[0].value);
    // console.log(this.state.diaSemana);
  }

  setMes(event){
    this.setState({
      mes: event.target.selectedOptions[0].value
    });
    // console.log(this.dropDownMenuSemana.current.value);
    // console.log(event.target.selectedOptions[0].value);
    // console.log(this.state.diaSemana);
  }

  handleChangeTelefone(event) {
    if(event.target.value.length>15) return;
    let telefoneValue = event.target.value.replace(/[^0-9]/g,'');
    if(telefoneValue.length >= 8){
      this.setState({telefoneEncryptado: aes.encrypt(telefoneValue)});
    }
    this.setState({telefone: telefoneValue});
  }

  handleChangeRedeSocial(event){
    let site = event.target.value;
    if(site.length>30) return;
    this.setState({site: site, redesocial:this.dropDownMenuRedeSocial.current.value+site});

  }
  
    
  handleChangeNumero(event) {
    if(event.target.value.length > 10) return;
    let numero = event.target.value.replace(/[^0-9]/g,'');
    this.setState({numero: numero});
  }

  handleClickMap(){
    // this.setState({lastMarkedCoords: coords});
    if(envVariables.lastMarked === undefined) return;
    this.setState({isLoading: true});
    (async function main(self) {
      await doc.useServiceAccountAuth({
          client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
          private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
      });

      await doc.loadInfo(); // Loads document properties and worksheets
      let {lat, lng} = envVariables.lastMarked.getLatLng();
      envVariables.lastMarked.latlng = [lat,lng];
      let regiao;
      if(envVariables.dentroLimites(envVariables.lastMarked.latlng)){
        regiao=0;
      }
      else{
        alert("Região não suportada");
        return;
      }
      const sheet = doc.sheetsByIndex[regiao];
      // const rows = await sheet.getRows();
      // Total row count

      // if(this.state.numero !== ''){
      //   this.state.numero = ", nº"+this.state.numero;
      // }
      
      // const row = { 
      //   Roaster: self.state.alimento, 
      //   URL:self.state.numero, 
      //   City: "", 
      //   Coordinates:JSON.stringify([self.props.location[0], self.props.location[1]]), 
      //   DateISO: new Date().toISOString(), 
      //   Telefone: self.props.telefone, 
      //   DiaSemana:self.props.diaSemana,
      //   Horario:self.props.horario,
      //   AlimentoEntregue:0,
      // };

      let dadosRow = {};
      dadosRow.alimento = self.state.alimento;
      dadosRow.numero = "";
      dadosRow.endereco = "";
      dadosRow.coords = envVariables.lastMarked.latlng;
      dadosRow.telefone = self.state.telefoneEncryptado;
      dadosRow.diaSemana = self.state.diaSemana;
      dadosRow.horario = self.state.horario;
      dadosRow.mes = self.state.mes;
      dadosRow.redesocial = self.state.redesocial;

      let row = envVariables.criarRow(dadosRow);
      // if(self.state.numero !== ''){
      //   self.state.numero = ", nº"+self.state.numero;
      // }
      // let dadosJSON = {
      //   "Roaster": self.state.alimento, 
      //   "Coordinates":JSON.stringify(envVariables.lastMarked.latlng), 
      //   "DateISO": new Date().toISOString(), 
      //   "Telefone": self.state.telefoneEncryptado, 
      //   "AlimentoEntregue":0,
      //   "URL":self.state.numero
      // };

      // if(self.state.alimento==='EntregaAlimentoPronto' || self.state.alimento==='PrecisandoBuscar')
      // {
      //   dadosJSON.DiaSemana=self.state.diaSemana;
      //   dadosJSON.Horario=self.state.horario;
        
      // }
      // row = { Dados: JSON.stringify(dadosJSON) };
      
      const result = await sheet.addRow(row);
      // console.log(result);
      window.location.reload();
  })(this);
  }

  componentDidMount() {

    // Google Sheets API
    // Based on https://github.com/theoephraim/node-google-spreadsheet

    var self = this;

    //current location    
    navigator.geolocation.getCurrentPosition(function(position) {
      envVariables.currentLocation = [position.coords.latitude, position.coords.longitude];
      self.setState({center: [position.coords.latitude, position.coords.longitude]}) 
    });

    (async function main(self) {
      // Use service account creds
      await doc.useServiceAccountAuth({
        client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
      });

      await doc.loadInfo(); // Loads document properties and worksheets
      
      /*https://www.keene.edu/campus/maps/tool/
        long, lat
        x, y
        -52.2070313, 2.20
        -52.4267578, -13.9234039
        -34.3212891, -14.0939572
        -34.3212891, 1.6696855
0: -8.0256189
1: -34.9175702
        -55.4589844, -32.6578757
        -55.5468750, -14.1791861
        -38.1445313, -14.1791861
        -38.0566406, -32.8426736
      */
     //limitar regiao
      let regiao;
      if(envVariables.dentroLimites(self.state.center)){
        regiao=0;
      }     
      else{
        alert("Região ainda não suportada");
        return;
      }
      const sheet = doc.sheetsByIndex[regiao];
      if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
      const rows = envVariables.rows;
      // Total row count
      self.setState({ rowCount: rows.length });
      
      // rows.filter( (x) => { return !x.Data}).map( (x) => {
      //   x.Dados = JSON.stringify(
      //     { 
      //       "Roaster": x.Roaster, 
      //       "URL": x.URL, 
      //       "City": x.City, 
      //       "Coordinates": x.Coordinates, 
      //       "DateISO": x.DateISO, 
      //       "Telefone": x.Telefone, 
      //       "DiaSemana": x.DiaSemana,
      //       "Horario": x.Horario,
      //       "AlimentoEntregue": x.AlimentoEntregue
      //     }
      //   );
      //   (async function main(x){
          
      //   await x.save();
      //   })(x);

      // })
      rows.forEach((x) => {
        let dados = JSON.parse(x.Dados);
        for(let key in dados){
          x[key] = dados[key];
        }
        // x.Roaster = dados.Roaster;
        // x.URL = dados.URL;
        // x.City = dados.City;
        // x.DateISO = dados.DateISO;
        // x.DiaSemana = dados.DiaSemana;
        // x.Horario = dados.Horario;
        // x.Mes = dados.Mes;
        // x.AlimentoEntregue = dados.AlimentoEntregue;
        // x.RedeSocial = dados.RedeSocial;
        // x.Avaliacao = dados.Avaliacao;
        
        if (dados.Coordinates) { x.mapCoords = JSON.parse(x.Coordinates); 
          if(dados.Telefone) {
            try{
              x.Telefone = aes.decrypt(x.Telefone);
            }catch(e){
              //problema ao decriptar, string nao esta no formato hex
            }
          } 
        }
       
      });
      self.setState({ dataMaps: rows });

      // var needsUpdates = rows.filter((x) => { x = JSON.parse(x); return !x.Coordinates; });
      // if(needsUpdates.length === 0) console.log("nao precisa atualizar");
      // if (needsUpdates && needsUpdates.length > 0) {
      //     for (let index in needsUpdates) {
      //       // if(needsUpdates[index]._rawData.length===0) needsUpdates[index].delete(); //se deixar rows vazias na planilha
      //         let city = needsUpdates[index].City;
      //         setTimeout(() => 
      //             {
      //                 (async function main() {
      //                     try{
      //                         let providerResult = await provider.search({ query: city.replace('-',",") + ', Brazil' });
                      
      //                         if(providerResult.length !== 0 ){
      //                             // throw new Error("endereco-nao-encontrado");
                      
      //                             console.log(providerResult);
      //                             let latlon = [providerResult[0].y, providerResult[0].x];
      //                             needsUpdates[index].Coordinates = JSON.stringify(latlon); // Convert obj to string
      //                             //needsUpdates[index].mapCoords = latlon;
      //                             await needsUpdates[index].save(); // Save to remote Google Sheet
      //                         }
      //                     }catch(e){
      //                         console.log("ERRO");
      //                         console.log(e);
      //                     }
      //                 })();
                  
      //             },1300                        
      //         );
              
      //     }
      //   self.setState({ dataMaps: rows });
      // }

      // Loading message 
      self.setState({ isLoading: false })

    })(self);

    window.fixarPonto = function (endereco, coords){
      (async function main(endereco, coords) {
        try{
          await doc.useServiceAccountAuth({
            client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });
      
          await doc.loadInfo(); // Loads document properties and worksheets
      
          const sheet = doc.sheetsByIndex[0];
          
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;

          let rowEncontrada = rows.filter( (x) => 
          {
            return JSON.parse(x.Dados).City.includes(endereco);
          }
          );

          rowEncontrada.forEach( (x) => 
          {
            let dadosNovos = JSON.parse(x.Dados);
            dadosNovos.Coordinates = JSON.stringify(coords);
            x.Dados = JSON.stringify(dadosNovos);
          });

          for(let x of rowEncontrada) await x.save();

        }catch(e){
          
        }
        
      })(endereco, coords);
    }

    //retornar os pontos proximos a 5km
    window.distance = function(){
      const rows = envVariables.rows;
      let proximos = [];
      rows.forEach( (x) => {
        let dado = JSON.parse(x.Dados);
        if(dado.Coordinates){
          let coords = JSON.parse(dado.Coordinates);
          let distancia = envVariables.distanceInKmBetweenEarthCoordinates(
            envVariables.currentLocation[0], 
            envVariables.currentLocation[1], 
            coords[0], 
            coords[1]);
            dado.distancia = distancia;
          if(distancia < 5) proximos.push(dado);
        }
      });
      
      proximos.sort(function(a,b){
        return a.distancia - b.distancia;
      });
      console.log(proximos);

    }
    window.stats = function (){
      (async function main() {
        try{
          await doc.useServiceAccountAuth({
            client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
          });
      
          await doc.loadInfo(); // Loads document properties and worksheets
      
          const sheet = doc.sheetsByIndex[0];
          
          if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
          const rows = envVariables.rows;
  
          let rowEncontrada = rows.filter( (x) => 
          {
            return JSON.parse(x.Dados).clicado;
          }
          );
          var SortedPoints = [];
          var tmp;
          rowEncontrada.forEach( (x) => 
          {
            let dadosNovos = JSON.parse(x.Dados);
            if(dadosNovos.Telefone) dadosNovos.Telefone = "https://wa.me/55"+aes.decrypt(dadosNovos.Telefone);
            SortedPoints.push(dadosNovos);
            for (var i = SortedPoints.length - 1; i > 0 && SortedPoints[i].clicado > SortedPoints[i-1].clicado; i--) {
                tmp = SortedPoints[i];
                SortedPoints[i] = SortedPoints[i-1];
                SortedPoints[i-1] = tmp;
            }
          });
          console.log("mais clicados");
          console.log(SortedPoints);

          
          rowEncontrada = rows.filter( (x) => 
          {
            return JSON.parse(x.Dados).clickTel;
          }
          );
          var SortedPoints = [];
          var tmp;
          rowEncontrada.forEach( (x) => 
          {
            let dadosNovos = JSON.parse(x.Dados);
            dadosNovos.Telefone = "https://wa.me/55"+aes.decrypt(dadosNovos.Telefone);
            SortedPoints.push(dadosNovos);
            for (var i = SortedPoints.length - 1; i > 0 && SortedPoints[i].clickTel > SortedPoints[i-1].clickTel; i--) {
                tmp = SortedPoints[i];
                SortedPoints[i] = SortedPoints[i-1];
                SortedPoints[i-1] = tmp;
            }
          });
          console.log("mais clicados em telefone");
          console.log(SortedPoints);

          rowEncontrada = rows.filter( (x) => 
          {
            return JSON.parse(x.Dados).AlimentoEntregue;
          }
          );
          var SortedPoints = [];
          var tmp;
          rowEncontrada.forEach( (x) => 
          {
            let dadosNovos = JSON.parse(x.Dados);
            SortedPoints.push(dadosNovos);
            for (var i = SortedPoints.length - 1; i > 0 && SortedPoints[i].AlimentoEntregue > SortedPoints[i-1].AlimentoEntregue; i--) {
                tmp = SortedPoints[i];
                SortedPoints[i] = SortedPoints[i-1];
                SortedPoints[i-1] = tmp;
            }
          });
          console.log("mais entregues");
          console.log(SortedPoints);


          rowEncontrada = rows.filter( (x) => 
          {
            return JSON.parse(x.Dados).Avaliacao;
          }
          );
          var SortedPoints = [];
          var tmp;
          rowEncontrada.forEach( (x) => 
          {
            let dadosNovos = JSON.parse(x.Dados);

            let AvaliacaoData = {nota:0, totalClicks:0};
            if(dadosNovos.Avaliacao){
                AvaliacaoData.totalClicks = (dadosNovos.Avaliacao["5"]+dadosNovos.Avaliacao["4"]+dadosNovos.Avaliacao["3"]+dadosNovos.Avaliacao["2"]+dadosNovos.Avaliacao["1"]);
                if( AvaliacaoData.totalClicks === 0 ){
                  //dadosNovos.Avaliacao="Nenhuma";
                }else{
                  dadosNovos.Avaliacao = (dadosNovos.Avaliacao["5"]*5 +
                    dadosNovos.Avaliacao["4"]*4 +
                    dadosNovos.Avaliacao["3"]*3 +
                    dadosNovos.Avaliacao["2"]*2 +
                    dadosNovos.Avaliacao["1"]*1)
                    /            
                    (AvaliacaoData.totalClicks);
    
                    AvaliacaoData.nota = Math.round(dadosNovos.Avaliacao * 100)/100;
                    AvaliacaoData.nota=AvaliacaoData.nota*100000+AvaliacaoData.totalClicks;
                }
            }
    
            //AvaliacaoData.nota = dadosNovos.Avaliacao;

            if(AvaliacaoData.nota>0) SortedPoints.push({...JSON.parse(x.Dados),"nota":AvaliacaoData.nota});
            for (var i = SortedPoints.length - 1; i > 0 && SortedPoints[i].nota > SortedPoints[i-1].nota; i--) {
                tmp = SortedPoints[i];
                SortedPoints[i] = SortedPoints[i-1];
                SortedPoints[i-1] = tmp;
            }
          });
          console.log("maiores notas");
          console.log(SortedPoints);          

  
        }catch(e){
          
        }
        
      })();
    }

//     window.planilhacsv = function (){
//       (async function main() {
//         try{
//           await doc.useServiceAccountAuth({
//             client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
//             private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY,
//           });
      
//           await doc.loadInfo(); // Loads document properties and worksheets
      
//           const sheet = doc.sheetsByIndex[0];
          
//           if(envVariables.rows===undefined) envVariables.rows = await sheet.getRows();
//           const rows = envVariables.rows;
  
//           let rowEncontrada = rows.filter( (x) => 
//           {
//             return JSON.parse(x.Dados).Telefone;
//           }
//           );
//           var planilhacsv="Situação,Telefone,coords,RedeSocial\n";
//           var tmp;
//           var result = {};
//           rowEncontrada.forEach( (x) => 
//           {
//             let y = JSON.parse(x.Dados);
//             planilhacsv+=[y.Roaster,aes.decrypt(y.Telefone),y.Coordinates,y.RedeSocial].toString()+"\n";
//           });
//           console.log(planilhacsv);

//           /**
//            * 
//            * {
//     "11": "São Paulo",
//     "12": "São Paulo",
//     "13": "São Paulo",
//     "14": "São Paulo",
//     "15": "São Paulo",
//     "16": "São Paulo",
//     "17": "São Paulo",
//     "18": "São Paulo",
//     "19": "São Paulo",
//     "21": "Rio de Janeiro",
//     "22": "Rio de Janeiro",
//     "24": "Rio de Janeiro",
//     "27": "Espírito Santo",
//     "28": "Espírito Santo",
//     "31": "Minas Gerais",
//     "32": "Minas Gerais",
//     "33": "Minas Gerais",
//     "34": "Minas Gerais",
//     "35": "Minas Gerais",
//     "37": "Minas Gerais",
//     "38": "Minas Gerais",
//     "41": "Paraná",
//     "42": "Paraná",
//     "43": "Paraná",
//     "44": "Paraná",
//     "45": "Paraná",
//     "46": "Paraná",
//     "47": "Santa Catarina",
//     "48": "Santa Catarina",
//     "49": "Santa Catarina",
//     "51": "Rio Grande do Sul",
//     "53": "Rio Grande do Sul",
//     "54": "Rio Grande do Sul",
//     "55": "Rio Grande do Sul",
//     "61": "Distrito Federal",
//     "62": "Goiás",
//     "63": "Tocantins",
//     "64": "Goiás",
//     "65": "Mato Grosso",
//     "66": "Mato Grosso",
//     "67": "Mato Grosso do Sul",
//     "68": "Acre",
//     "69": "Rondônia",
//     "71": "Bahia",
//     "73": "Bahia",
//     "74": "Bahia",
//     "75": "Bahia",
//     "77": "Bahia",
//     "79": "Sergipe",
//     "81": "Pernambuco",
//     "82": "Alagoas",
//     "83": "Paraíba",
//     "84": "Rio Grande do Norte",
//     "85": "Ceará",
//     "86": "Piauí",
//     "87": "Pernambuco",
//     "88": "Ceará",
//     "89": "Piauí",
//     "91": "Pará",
//     "92": "Amazonas",
//     "93": "Pará",
//     "94": "Pará",
//     "95": "Roraima",
//     "96": "Amapá",
//     "97": "Amazonas",
//     "98": "Maranhão",
//     "99": "Maranhão"
// }
//            */

  
//         }catch(e){
          
//         }
        
//       })();
//     }
  }

  

  render() {
    return (
      <div className="App">
        <Header rowCountProp={this.state.rowCount} />
        {/* <InserirEndereco/>
        <MyLocationButton location={this.state.center}/> */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Paper id="CoffeeMap" className="fadeIn">
              {this.state.isLoading
                ? <div className="flexLoading"><div className="loading">Carregando...</div></div>
                : <CoffeeMap 
                dataMapsProp={this.state.dataMaps} 
                location={this.state.center} 
                tileMapOption={this.state.tileMapOption} 
                removerPonto={this.removerPonto} 
                verificarPonto={this.verificarPonto} 
                entregarAlimento={this.entregarAlimento}
                avaliar={this.avaliar}
                filtro={this.state.filtro}
                contabilizarClicado={this.contabilizarClicado}
                clicouTelefone={this.clicouTelefone}
                />
              }
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={4}>
          {/* https://smartdevpreneur.com/setting-material-ui-grid-item-height/ */}
            <Paper id="CoffeeTable" style={{height:'100%'}} className="toolPanel2">
              {this.state.isLoading
                ? <div className="flexLoading"><div className="loading"><CircularProgress /></div></div>
                // : <CoffeeTable dataMapsProp={this.state.dataMaps} dataHeaderProp={this.state.dataHeader} />
              : 
              
    <div className='relativePosition'>
      {/* <a target='_blank' rel="noreferrer" href="https://api.whatsapp.com/send/?phone=5583996157234&text=quero+me+voluntariar+no+mapa+fome&app_absent=0">quero me voluntariar no Mapa Fome</a>
      <br/> */}
      filtro atual:  
              <select ref= {this.dropDownMenuFiltro} id="filtro" onChange={this.setFiltro}>
                <option value="Todos">Todos</option>
                <option value="Doadores">Doadores</option>
                <option value="CestaBasica">Cesta básica</option>
                <option value="MoradorRua">Situação de rua</option>
                <option value="Refeição Pronta">Refeição Pronta</option>
                <option value="RedeSocial">Rede Social</option>
                <option value="Verificados">possui CNPJ</option>
                <option value="Nenhum">Nenhum</option>
              </select>
              <Checkbox
                checked={this.state.telefoneFilterLocal}
                onChange={this.telefoneFilterChange}
                inputProps={{ 'aria-label': 'controlled' }}
              /> Telefone
                {/* RADIO BUTTON */}
        <div className='relativePosition'>
          <ul>
            
          <li>
              <label className='uxLi'>
                <input
                  type="radio"
                  value="Teste"
                  checked={this.state.alimento === "Teste"}
                  onChange={this.setTipoAlimento}
                />
                <span> Opção para testar a ferramenta </span>
              </label>
            </li>
          <li>
              <label className='uxLi'>
                <input
                  type="radio"
                  value="Alimento pronto"
                  checked={this.state.alimento === "Alimento pronto"}
                  onChange={this.setTipoAlimento}
                />
                <span className='yellowHub'> Pessoa precisando de Alimento pronto <img width="30px" height="30px" src={coffeeBean}></img></span>
              </label>
            </li>

            <li>
              <label className='uxLi'>
                <input
                  type="radio"
                  value="Alimento de cesta básica"
                  checked={this.state.alimento === "Alimento de cesta básica"}
                  onChange={this.setTipoAlimento}
                />
                <span className='yellowHub'> Preciso de Alimento de cesta básica <img width="30px" height="30px" src={coffeeBean}></img></span>
              </label>
            </li>
                        
            <li>
              <label className='uxLi'>
                <input
                  type="radio"
                  value="Doador"
                  checked={this.state.alimento === "Doador"}
                  onChange={this.setTipoAlimento}
                />
                <span className='blueHub'> Recebo para doar <img width="30px" height="30px" src={hub}></img></span>
              </label>
            </li>

            <li>
            <label className='uxLi'>
                <input
                  type="radio"
                  value="EntregaAlimentoPronto"
                  checked={this.state.alimento === "EntregaAlimentoPronto"}
                  onChange={this.setTipoAlimento}
                />
                <span className='redHub'> Entrego refeições em ponto fixo <img width="30px" height="30px" src={red}></img></span>
              
                <br></br>
                <select ref= {this.dropDownMenuSemanaEntregaAlimentoPronto} style={{"display":"none"}} id="dia" onChange={this.setDiaSemana}>
                <option value="nas Segundas">nas Segundas</option>
                <option value="nas Terças">nas Terças</option>
                <option value="nas Quartas">nas Quartas</option>
                <option value="nas Quintas">nas Quintas</option>
                <option value="nas Sextas">nas Sextas</option>
                <option value="nos Sábados">nos Sábados</option>
                <option value="nos Domingos">nos Domingos</option>
                <option value="todo dia">todo dia</option>
              </select>
              <select ref= {this.dropDownMenuHorarioEntregaAlimentoPronto} style={{"display":"none"}} id="horario" onChange={this.setHorario}>
                <option value="manhã 05:30">manhã 05:30</option>
                <option value="manhã 06:30">manhã 06:30</option>
                <option value="manhã 09:30">manhã 09:30</option>
                <option value="tarde 13:30">tarde 13:30</option>
                <option value="tarde 16:30">tarde 16:30</option>
                <option value="noite 18:30">noite 18:30</option>
                <option value="noite 19:30">noite 19:30</option>
              </select>

              
              <select ref= {this.dropDownMenuMesEntregaAlimentoPronto} style={{"display":"none"}} id="mes2" onChange={this.setMes}>
                <option value="x4 por mês">x4 por mês</option>
                <option value="x3 por mês">x3 por mês</option>
                <option value="x2 por mês">x2 por mês</option>
                <option value="x1 por mês">x1 por mês</option>
              </select>
              </label>
            </li>

            <li>
              <label className='uxLi'>
                <input
                  type="radio"
                  value="PrecisandoBuscar"
                  checked={this.state.alimento === "PrecisandoBuscar"}
                  onChange={this.setTipoAlimento}
                />
                <span className='greenHub'> Tenho alimento perto de se perder <a target='_blank' rel="noreferrer" href="https://www.camara.leg.br/noticias/670937-nova-lei-incentiva-empresas-a-doarem-alimentos-e-refeicoes-para-pessoas-vulneraveis/">(lei)</a>  <img width="30px" height="30px" src={green}></img></span>
              
              <br></br>
              <select ref= {this.dropDownMenuSemanaPrecisandoBuscar} style={{"display":"none"}} id="dia2" onChange={this.setDiaSemana}>
                <option value="Hoje">Hoje</option>
                <option value="nas Segundas">nas Segundas</option>
                <option value="nas Terças">nas Terças</option>
                <option value="nas Quartas">nas Quartas</option>
                <option value="nas Quintas">nas Quintas</option>
                <option value="nas Sextas">nas Sextas</option>
                <option value="nos Sábados">nos Sábados</option>
                <option value="nos Domingos">nos Domingos</option>
              </select>
              <select ref= {this.dropDownMenuHorarioPrecisandoBuscar} style={{"display":"none"}} id="horario2" onChange={this.setHorario}>
                <option value="manhã 05:30">manhã 05:30</option>
                <option value="manhã 06:30">manhã 06:30</option>
                <option value="manhã 09:30">manhã 09:30</option>
                <option value="tarde 13:30">tarde 13:30</option>
                <option value="tarde 16:30">tarde 16:30</option>
                <option value="noite 18:30">noite 18:30</option>
                <option value="noite 19:30">noite 19:30</option>
              </select>
              
              <select ref= {this.dropDownMenuMesPrecisandoBuscar} style={{"display":"none"}} id="mes2" onChange={this.setMes}>
                <option value="x4 por mês">x4 por mês</option>
                <option value="x3 por mês">x3 por mês</option>
                <option value="x2 por mês">x2 por mês</option>
                <option value="x1 por mês">x1 por mês</option>
              </select>
              </label>
              
            </li>

          
          </ul>
    </div>
        {/* FIM RADIO BUTTON */}
            <div className='relativePosition'>
                
                <input className="TextField tfMarginUp" type="text" placeholder='Insira DDD telefone se quiser' /*value={this.state.telefone}*/ onBlur={this.handleChangeTelefone} />
                <input className='nLocal' type="text" placeholder='nº' /*value={this.state.numero}*/ onBlur={this.handleChangeNumero} />
                
                <br/>
                <select style={{"display":"none"}} ref= {this.dropDownMenuRedeSocial}>
                  <option value="instagram.com/">Insta</option>
                  <option value="facebook.com/">Face</option>
                </select>
                <input ref= {this.redesocialRef} style={{"display":"none"}} className="TextField" type="text" placeholder='@' /*value={this.state.site}*/ onBlur={this.handleChangeRedeSocial} />
                
                <br></br>
                <div className='buttonsSidebySide'>
                  <MyLocationButton
                  location={this.state.center} 
                  alimento={this.state.alimento} 
                  telefone={this.state.telefoneEncryptado}
                  diaSemana={this.state.diaSemana}
                  horario={this.state.horario}
                  numero={this.state.numero}
                  redesocial={this.state.redesocial}
                  mes={this.state.mes}
                  /> 

                  {this.state.isLoading?
                  <CircularProgress/>
                  :<button className="SubmitButton buttonsSidebySide" onClick={this.handleClickMap}>marcar Local Tocado</button>}
                </div>
                <figure><center>OU</center></figure>
                <InserirEndereco 
                alimento={this.state.alimento} 
                telefone={this.state.telefoneEncryptado}
                diaSemana={this.state.diaSemana}
                horario={this.state.horario}
                redesocial={this.state.redesocial}
                mes={this.state.mes}
                /> 

                {/* <input className="TextField" type="text" placeholder='Insira o site do projeto' value={this.state.site} onChange={this.handleChangeSite} />
                <br></br> */}
                

               
              </div>
              
          </div>
               
              }
            </Paper>
          </Grid>


          <Grid item xs={12} sm={12}>
            <Paper id="MoreInfo" style={{height:'100%'}} >
            {/* Contribua também Sinalizando projetos que arrecadam e entregam alimentos na sua cidade, <a target='_blank' rel="noreferrer" href="https://www.google.com.br/search?q=suaCidade+~voluntarios+OR+%22grupo%22+AND+~doacoes+AND+%22alimentos%22+%2290000..99999%22+OR+%228000..9999%22">entrando em contato com eles</a> para eles sinalizarem
             <br/>  */}
            <a className="wpbtn" title="share to whatsapp" href="whatsapp://send?text=Para marcar no mapa e alimentar quem tem fome, achei esse site: www.mapafome.com.br"> <img className="wp" src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt=""/>
                Compartilhar no Whatsapp</a>
                <a style={{float:'right'}} target='_blank' rel="noreferrer" href="https://t.me/share?url=www.mapafome.com.br&amp;text=Para%20marcar%20no%20mapa%20e%20alimentar%20quem%20tem%20fome%2C%20achei%20esse%20site%3A" className="tgme_widget_share_btn"><img className="telegram" src="https://telegram.org/img/WidgetButton_LogoSmall.png" alt=""></img></a>

                <br></br>
              Mapeados: {this.state.rowCount}<br></br>
              <a href='https://play.google.com/store/apps/details?id=br.com.mapafome'><img style={{height:'55px'}} alt='Disponível no Google Play' src='https://play.google.com/intl/en_us/badges/static/images/badges/pt_badge_web_generic.png'/></a>
              <a target='_blank' rel="noreferrer" href="https://instagram.com/mapafome"><img style={{height:'55px'}}src="https://play-lh.googleusercontent.com/VRMWkE5p3CkWhJs6nv-9ZsLAs1QOg5ob1_3qg-rckwYW7yp1fMrYZqnEFpk0IoVP4LM=w240-h480-rw"/></a>
            
              <br></br>No mapa clique na bolinha para saber como ajudar.<br></br> Você pode se incluir ou incluir outra pessoa, <br></br>selecione a situação e confirme o local (mais informações <a target='_blank' rel="noreferrer" href="https://g1.globo.com/pe/pernambuco/noticia/2022/02/10/site-criado-por-estudante-da-ufpe-aproxima-pessoas-que-estao-passando-fome-e-doadores-de-comida.ghtml">na matéria da Globo</a>)(<a href="https://globoplay.globo.com/v/10350537/">e jornal hoje da Globo em rede nacional</a>):
              <br></br><span className="yellowHub">  em amarelo são pessoas <img width="30px" height="30px" src={coffeeBean}></img></span>em vulnerabilidade social e insegurança alimentar que estão com fome em casa ou na rua, --precisam de alimento
              <br></br><span className="blueHub">  em azul são pessoas <img width="30px" height="30px" src={hub}></img></span>que recebem alimentos ou recursos para distribuir alimento ou refeições na comunidade (exemplo: sopão solidário, ongs, voluntários) --precisam de doações
              <br></br><span className="redHub">  em vermelho são pessoas <img width="30px" height="30px" src={red}></img></span>que entregam refeição em ponto fixo na rua em certo dia na semana. --ponto de entrega de alimento pronto
              <br></br><span className="greenHub">  em verde são pessoas <img width="30px" height="30px" src={green}></img></span>que trabalham com alimentos e precisam destinar os alimentos não comercializados ou não consumidos e não tem pessoas para buscar esses alimentos (exemplo: restaurante, hotel, lanchonete, feira livre, supermercados) --precisam de voluntários para buscar 
            
              <br></br>
              <br></br>
              <CreatorsMapaFome/>
              <br/>
			  em agradecimento a formação humana, moral e ética que recebi dos meus professores de Filosofia e Sociologia do ensino médio
			  <br/><span style={{"font-size":"1.4em","color":"blue"}}>•</span>por terem passado o premiado documentário com base em fatos reais curta de 13 minutos do brasileiro Jorge Furtado <a target='_blank' rel="noreferrer" href="https://www.youtube.com/watch?v=JcP9v5mZT9w">Ilha das Flores</a>
			  <br/><span style={{"font-size":"1.4em","color":"blue"}}>•</span>após 10 anos de ter assistido, aprendido e internalizado e entendido nosso papel como sociedade e comunidade, tive a oportunidade de agir usando conhecimento e tecnologias acumulado ao longo do tempo 
			  <br/><span style={{"font-size":"1.4em","color":"blue"}}>•</span>e a base para criação de projetos (pesquisa de campo e Project Manager) obtida na disciplina de Projetão CIn UFPE 
			  <br/><span style={{"font-size":"1.4em","color":"red"}}>•</span>resultou em obter as ferramentas necessárias para agir em favor das pessoas que passam fome
			  <br/><span style={{"font-size":"1.4em","color":"red"}}>•</span>e dar visibilidade, e contribuir junto com as pessoas de bom coração a elas que rotinamente agem alimentando quem não tem dinheiro para comprar comida
			  <br/><span style={{"font-size":"1.4em","color":"green"}}>•</span>e contribuir com os comerciantes de alimentos a reduzirem o desperdício de alimento
			  <br/><span style={{"font-size":"1.4em","color":"red"}}>•</span>e motivar e ofertar ferramentas necessárias para cada ser humano fazer sua parte e poder colaborar de forma recorrente, saber e encontrar a quem ofertar alimento
			  <br/><span style={{"font-size":"1.4em","color":"orange"}}>•</span>ou se não com o alimento, com o compartilhamento de informação ao informar da existência do MAPA FOME que é gratuito, a quem precisa e a quem pode ajudar, pois irão saber a quem buscar
			  <br/><span style={{"font-size":"1.4em","color":"red"}}>•</span>sem comida, qualquer ser humano morre prematuramente. e qualquer pessoa ao deixar de prestar assistência, quando possível fazê-lo sem risco pessoal, à pessoa (...) ao desamparo ou em grave e iminente perigo = praticar crime de Omissão de socorro Art. 135 Código Penal Brasileiro
			  
			  <table style={{"width":"94%", "text-align":"center"}}>
				  <tr style={{"background-color":"#c8dff5"}}>
					<th style={{"width":"7%"}}>Tempo<br/>de<br/>Fome</th>
					<th style={{"width":"86%"}}>Consequências ruins</th>
					<th style={{"width":"7%"}}>Risco de vida<br/>da pessoa<br/>desamparada</th>
				  </tr>
				  <tr>
					<td>0-3<br/>horas</td>
					<td>Mudança mínima</td>
					<td>0</td>
				  </tr>
				  <tr style={{"background-color":"#c8dff5"}}>
					<td>4-8<br/>horas</td>
					<td style={{"padding":"3%"}}>Você vai sentir mais fome e sua barriga vai doer um pouco, e pode ter dor de cabeça</td>
					<td>0</td>
				  </tr>
				  <tr>
					<td>9-12<br/>horas</td>
					<td style={{"padding":"3%"}}>Você vai começar a se sentir cansado e rabugento, raivoso, irritado, estressado e vai ter dor de cabeça</td>
					<td>baixa</td>
				  </tr>
				  <tr style={{"background-color":"#c8dff5"}}>
					<td>13-16<br/>horas</td>
					<td style={{"padding":"3%"}}>vai ser mais difícil prestar atenção ou se concentrar</td>
					<td>moderada</td>
				  </tr>
				  <tr>
					<td>17-24<br/>horas</td>
					<td style={{"padding":"3%"}}>Seu corpo vai não ter açúcar suficiente, o que vai fazer você se sentir tonto ou TREMENDO</td>
					<td>moderada</td>
				  </tr>
				  <tr style={{"background-color":"#c8dff5"}}>
					<td>25-48<br/>horas</td>
					<td style={{"padding":"3%"}}>Você vai se sentir fraco e entra em situação de alto estresse e em modo de sobrevivência seu coração vai bater mais rápido pois falta energia que vem da comida, então tenta trabalhar dobrado na tentativa de manter o resultado (entrega de oxigênio e nutrientes para orgão vitais)</td>
					<td>alta</td>
				  </tr>
				  <tr>
					<td>49-72<br/>horas</td>
					<td style={{"padding":"3%"}}>Seu corpo vai começar a usar energia armazenada (gordura,...), o que vai fazer você se sentir cansado e seu sistema imunológico vai não funcionar tão bem, fica doente mais facilmente</td>
					<td>alta</td>
				  </tr>
				  <tr style={{"background-color":"#c8dff5"}}>
					<td>3-7<br/>dias</td>
					<td style={{"padding":"3%"}}>Os músculos passam a serem consumidos como energia, você vai se sentir muito fraco e seus músculos vão diminuir. Isso não é bom para o seu corpo, danifica o organismo. Diminuição da motivação ou produtividade</td>
					<td>alta</td>
				  </tr>
				  <tr>
					<td>8-14<br/>dias</td>
					<td style={{"padding":"3%"}}>Seus órgãos, que são partes importantes do seu corpo, vão ficar feridos e você vai ficar doente muito mais facilmente</td>
					<td>muito alta</td>
				  </tr>
				  <tr style={{"background-color":"#c8dff5"}}>
					<td>15-21<br/>dias</td>
					<td style={{"padding":"3%"}}>Você vai ficar muito doente e sua vida vai estar em perigo</td>
					<td>extremamente alto</td>
				  </tr>
				  <tr>
					<td>22+<br/>dias</td>
					<td style={{"padding":"3%"}}>Você está em perigo extremo porque seu corpo não está recebendo comida suficiente, e seus órgãos vão parar de funcionar corretamente ou parar a qualquer momento</td>
					<td>extremamente alto</td>
				  </tr>
				</table>
        <br/>Conclusão: Faço um apelo a você tomar medidas e ações solidárias e qualquer forma de iniciativa recorrentes, em intervalos de 1 dia a 14 dias (intervalos recorrentes de mínimo diário ou menos, máximo 2 semanas ou menos), alivie a dor e sofrimento de outro ser humano
				<br/>
              
                {/* <img src={qr} alt=""/> */}
                {/* <CleanOld></CleanOld> */}
                <img className="ods" alt="" src="https://brasil.un.org/profiles/undg_country/themes/custom/undg/images/SDGs/pt-br/SDG-2.svg"></img> No Mapa Fome você pode encontrar a quem ajudar e fazer novas marcações, caso uma opção represente você ou outra pessoa, selecione, coloque número para contato se quiser, e confirme com localização atual ou endereço e número
              
                
                <br></br><br></br>serve para 

<br></br>-mapear pessoas que estão com fome na rua ou em casa
<br></br>-mapear iniciativas que recebem recursos para fazer doação
<br></br>-mostrar no mapa onde e quando tem alimento sendo distribuído
<br></br>-mostrar no mapa lugares comerciais ou residenciais que precisam de voluntários ou necessitados para buscar alimentos não consumidos ou não comercializados
<br></br> é possível traçar uma rota ao destino ao clicar Ir para o destino, e ser redirecionado para o Google Maps
<br></br>
contato: <a target='_blank' rel="noreferrer" href="https://mail.google.com/mail/u/0/?fs=1&to=rslgp@cin.ufpe.br&tf=cm" >rslgp@cin.ufpe.br</a> <a target='_blank' rel="noreferrer"  href='https://wa.me/5583996157234'>(83) 9.9615-7234</a>           
<Sugestao/>
        <a target='_blank' rel="noreferrer" href="./privacy.html">Privacy Policy</a>
        <span> - </span>
        <a target='_blank' rel="noreferrer" href="./terms.html">Terms</a>
        </Paper>
          </Grid>

        </Grid>

      </div>
    );
  }
}

export default App;
