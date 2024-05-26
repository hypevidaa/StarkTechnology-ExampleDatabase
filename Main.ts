import { Database, Tabella, Colonna } from './modules/Database';
import { writeFileSync } from 'fs';
import { join } from 'path';

function generateSequelizeModel(tabella: Tabella, database: Database) {
    let modelContent = `import { Table, Column, Model, ForeignKey, BelongsTo } from 'sequelize-typescript';
  import { ${database.relazioni[0].tabellaDestinazione} } from './${database.relazioni[0].tabellaDestinazione}';
  
  @Table
  export class ${tabella.nome} extends Model<${tabella.nome}> {
  `;
  
    for (let colonna of tabella.colonne) {
      if (colonna.nome === database.relazioni[0].chiaveOrigine && tabella.nome === database.relazioni[0].tabellaOrigine) {
        modelContent += `  @ForeignKey(() => ${database.relazioni[0].tabellaDestinazione})
    @Column
    ${colonna.nome}: ${colonna.tipo};
  
    @BelongsTo(() => ${database.relazioni[0].tabellaDestinazione})
    ${database.relazioni[0].tabellaDestinazione.toLowerCase()}: ${database.relazioni[0].tabellaDestinazione};
  `;
      } else {
        modelContent += `  @Column
    ${colonna.nome}: ${colonna.tipo};
  `;
      }
    }
  
    modelContent += '}';
  
    return modelContent;
  }
  
  function generateLaravelModel(tabella: Tabella, database: Database) {
    let modelContent = `<?php
  
  namespace App;
  
  use Illuminate\\Database\\Eloquent\\Model;
  
  class ${tabella.nome} extends Model
  {
      protected $table = '${tabella.nome.toLowerCase()}';
      public $timestamps = false;
      protected $fillable = [
  `;
  
    for (let colonna of tabella.colonne) {
      modelContent += `        '${colonna.nome}',
  `;
    }
  
    modelContent += `    ];
  `;
  
    for (let relazione of database.relazioni) {
      if (relazione.tabellaOrigine === tabella.nome) {
        modelContent += `
      public function ${relazione.tabellaDestinazione.toLowerCase()}()
      {
          return $this->belongsTo('${relazione.tabellaDestinazione}');
      }
  `;
      } else if (relazione.tabellaDestinazione === tabella.nome) {
        modelContent += `
      public function ${relazione.tabellaOrigine.toLowerCase()}()
      {
          return $this->hasMany('${relazione.tabellaOrigine}');
      }
  `;
      }
    }
  
    modelContent += `}
  `;
  
    return modelContent;
  }
  
  function generateModels(database: Database, language: string) {
    for (let tabella of database.tabelle) {
      let modelContent;
      if (language === 'typescript') {
        modelContent = generateSequelizeModel(tabella, database);
      } else if (language === 'php') {
        modelContent = generateLaravelModel(tabella, database);
      } else {
        throw new Error(`Unsupported language: ${language}`);
      }
      writeFileSync(join(__dirname, 'out', language, `${tabella.nome}.php`), modelContent);
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
generateModels(db, 'typescript');

// Utilizzo della funzione
generateModels(db, 'php');