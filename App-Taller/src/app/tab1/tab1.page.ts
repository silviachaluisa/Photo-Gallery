import { Component } from '@angular/core';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  display: string = '';

  // Agrega el valor al display
  appendToDisplay(value: string) {
    this.display += value;
  }

  // Limpia el display
  clearDisplay() {
    this.display = '';
  }

  // Calcula el resultado
  calculateResult() {
    try {
      // Evalúa la expresión en display y convierte a string
      this.display = eval(this.display.replace('÷', '/').replace('x', '*')).toString();
    } catch (error) {
      this.display = 'Error';
    }
  }
}
