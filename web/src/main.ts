import { mount } from 'svelte';
import App from './App.svelte';
import './styles/tokens.css';
import './styles/themes.css';
import './app.css';

mount(App, { target: document.getElementById('app')! });
