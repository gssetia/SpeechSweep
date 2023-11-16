/**
 * @format
 */
import * as React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import { ThemeProvider } from '@rneui/themed';


// const theme = {
//     ...DefaultTheme,
//     "colors": {
//         "primary": "rgb(55, 69, 172)",
//     }
//   };

export default function Main() {
  
    return (
        <ThemeProvider>
            <App /> 
        </ThemeProvider>
        
    );
  }

AppRegistry.registerComponent(appName, () => Main);
