import { mount } from 'svelte';
import App from './App.svelte';
import './app.scss';
import './styles/tokens.scss';
import './styles/themes.scss';
import './styles/ui-framework.scss';

mount(App, { target: document.getElementById('app')! });
