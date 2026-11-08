import { mount } from 'svelte';
import App from './App.svelte';
import './app.css';
import './styles/tokens.css';
import './styles/themes.css';

mount(App, { target: document.getElementById('app')! });
