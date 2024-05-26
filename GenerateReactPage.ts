import { Database, Tabella, Colonna } from './modules/Database';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

function generateReactPage(tabella: Tabella) {
  let pageContent = `import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

function ${tabella.nome}Page() {
  const { id } = useParams();
  const [state, setState] = useState({
`;

  for (let colonna of tabella.colonne) {
    pageContent += `    ${colonna.nome}: '',
`;
  }

  pageContent += `  });

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Add code to save the entity
  };

  return (
    <form onSubmit={handleSubmit}>
`;

  for (let colonna of tabella.colonne) {
    pageContent += `      <label>
        ${colonna.nome}:
        <input type="text" name="${colonna.nome}" value={state.${colonna.nome}} onChange={handleChange} />
      </label>
`;
  }

  pageContent += `      <input type="submit" value="Save" />
    </form>
  );
}

export default ${tabella.nome}Page;
`;

  return pageContent;
}

function generateReactPages(database: Database) {
  mkdirSync(join(__dirname, 'out', 'frontend'), { recursive: true });
  for (let tabella of database.tabelle) {
    const pageContent = generateReactPage(tabella);
    writeFileSync(join(__dirname, 'out', 'frontend', `${tabella.nome}Page.jsx`), pageContent);
  }
}



// Definizione del database
let db: Database = {
    tabelle: [
      {
        nome: 'Utenti',
        colonne: [
          { nome: 'id', tipo: 'number' },
          { nome: 'nome', tipo: 'string' },
          { nome: 'email', tipo: 'string' },
        ],
      },
      {
        nome: 'Ordini',
        colonne: [
          { nome: 'id', tipo: 'number' },
          { nome: 'data', tipo: 'string' },
          { nome: 'idUtente', tipo: 'number' },
        ],
      },
    ],
    relazioni: [
      {
        tabellaOrigine: 'Ordini',
        tabellaDestinazione: 'Utenti',
        chiaveOrigine: 'idUtente',
        chiaveDestinazione: 'id',
      },
    ],
  };

// Utilizzo della funzione
generateReactPages(db);