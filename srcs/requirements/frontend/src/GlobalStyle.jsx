import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
    :root 
    {
        --primary-green: #4ade80;
        --dark-green: #14532d;
        --light-green-bg: #f0fdf4;
        --card-bg: #ffffff;
        --border-color: #dcfce7;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body 
    {
        font-family: 'Inter', system-ui, sans-serif;
        background-color: var(--light-green-bg);
        color: #333;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        overflow-x: hidden;
    }
`;

export default GlobalStyle;