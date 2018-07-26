import React, { Component, Fragment } from 'react';
import "./Cadastro.css";
import "./../../../../componentes/Box/Box.css";
import "./../../../../componentes/Input/Input.css";
import carregando from "./../../../../imgs/progress_bubbles.gif";
import falhou from "./../../../../imgs/image_105_x.png";
import verificado from "./../../../../imgs/image_105_v.png";
import validateEmail from "./../../../../extras/validateEmail.js";

export default class Cadastro extends Component {
	constructor(props) {
		super(props);

		this.state = {
			cena: "detalhes", // detalhes, vincular
			verificando: (
				<Fragment></Fragment>
			),
			nome: "",
			email: "",
			senha: "",
			re_senha: "",
			termos: false,
			hotel: null,
			verificado: false
		};
	}

	mudarCena = (cena) => {
		this.setState({
			cena: cena
		});
	}

	voltar = () => {
		if (this.state.cena === "detalhes") {
			this.props.mudarCena("entrar");
		} else if (this.state.cena === "vincular") {
			this.mudarCena("detalhes");
		}
	}

	proximo = () => {
		if (this.state.cena === "detalhes") {
			if (this.state.nome === "") {
				// Nome vazio
			} else if (!/^[a-zA-Z0-9-._]{2,64}$/g.test(this.state.nome)) {
				// Tem espaço
			} else if (this.state.email === "") {
				// Email vazio
			} else if (!validateEmail(this.state.email)) {
				// Não é email
		 	} else if (this.state.senha === "") {
				// Senha vazia
			} else if (this.state.re_senha === "") {
				// Resenha vazia
			} else if (this.state.senha !== this.state.re_senha) {
				// As senhas não conferem
			} else if (!this.state.termos) {
				// Não aceitou os termos
			} else {
				this.mudarCena("vincular");
			}
		} else if (this.state.cena === "vincular") {
			if (this.state.hotel !== null || this.state.hotel !== "🇩🇫") {
				// Hotel não selecionado
			} else if (!this.state.verificado) {
				// Usuário não verificado
			} else {
				// Login
			}
		}
	}

	verificarMissao = () => {
		// API Habbo...
		this.setState({
			verificando: <img src={ carregando } alt="Os dados do HABBO estão sendo acessados, aguarde..." />
		});
		setTimeout(() => this.setState({
			verificando: <img src={ falhou } alt="A resposta obtida foi negativa." />
		}), 2000);
		setTimeout(() => this.setState({
			verificando: <img src={ verificado } alt="A resposta obtida foi positiva." />
		}), 4000);
	}

	submitPrevent = (e) => {
		e.preventDefault();
	}

	handleInputNome = (e) => this.setState({nome: e.target.value});
	handleInputEmail = (e) => this.setState({email: e.target.value});
	handleInputSenha = (e) => this.setState({senha: e.target.value});
	handleInputReSenha = (e) => this.setState({re_senha: e.target.value});
	handleInputTermos = (e) => this.setState({termos: e.target.checked});
	handleSelectHotel = (e) => this.setState({hotel: e.target.value});


	render() {
		let titulo, corpo;
		switch (this.state.cena) {
			case 'vincular':
				titulo = "Vincular conta";
				corpo = (
					<Fragment>
						<form onSubmit={ this.submitPrevent }>
							<fieldset>
								<select value={ this.state.hotel ? this.state.hotel : "🇩🇫" } onChange={ this.handleSelectHotel }>
									<option value="🇩🇫" disabled hidden>Escolha seu hotel</option>
									<option value="🇧🇷">Brasil/Portugal/Angola (.com.br)</option>
									<option value="🇪🇸">Espanha (.es)</option>
									<option value="🇫🇮">Finlândia (.fi)</option>
									<option value="🇺🇸">Estados Unidos (.com)</option>
									<option value="🇫🇷">França (.fr)</option>
									<option value="🇳🇱">Holanda (.nl)</option>
									<option value="🇮🇹">Itália (.it)</option>
									<option value="🇩🇪">Alemanha (.de)</option>
									<option value="🇩🇷">Derivado (.?)</option>
								</select>
								<br /><br />
								<span>Seu nick será exibido desta forma:</span>
								<br />
								<span>{ this.state.nome } <sub>[</sub>{ this.state.hotel }<sub>]</sub></span>
								<br /><br />
								<label>
									<span>Coloque este código na sua missão:</span>
									<br />
									<input type="text" value="BRA123" disabled />
									{ this.state.verificando }
								</label>
								<button type="button" onClick={ this.verificarMissao }>Verificar missão</button>
							</fieldset>
						</form>
					</Fragment>
				)
			break;
			case 'detalhes':
			default:
				titulo = "Detalhes da conta";
				corpo = (
					<Fragment>
						<form onSubmit={ this.submitPrevent }>
							<label>
								<span>Nome do usuário:</span>
								<br />
								<input type="text" autoComplete="name" onChange={ this.handleInputNome } value={ this.state.nome } />
							</label>
							<br />
							<label>
								<span>Email:</span>
								<br />
								<input type="e-mail" autoComplete="email" onChange={ this.handleInputEmail } value={ this.state.email } />
							</label>
							<div id="passwords">
								<div>
									<label>
										<span>Senha:</span>
										<br />
										<input type="password" autoComplete="new_password" onChange={ this.handleInputSenha } />
									</label>
								</div>
								<div>
									<label>
										<span>Repita a senha:</span>
										<br />
										<input type="password" autoComplete="new_password" onChange={ this.handleInputReSenha } />
									</label>
								</div>
							</div>
							<label>
								<input type="checkbox" onChange={ this.handleInputTermos } checked={ this.state.termos } />
								Eu sei, o Traxômetro não é da Sulake
							</label>
						</form>
						<button type="button">Regras do Traxômetro - leia-as agora!</button>
					</Fragment >
				)
		}
		return (
			<div className="Cadastro Caixa">
				<header>
					<button onClick={ () => this.props.mudarCena("entrar") }>close</button>
					<h1>{ titulo }</h1>
				</header>
				<main>
					{ corpo }
				</main>
				<footer>
					<input type="button" value="Voltar" onClick={ this.voltar } />
					<span>{ this.state.cena === "detalhes" ? "1" : "2" }/2</span>
					<input type="button" value={ this.state.cena === "detalhes" ? "Próximo" : this.state.cena === "vincular" ? "Feito" : "" } onClick={ this.proximo } />
				</footer>
			</div>
		)
	}
}