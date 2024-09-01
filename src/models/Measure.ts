import { Sequelize, Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../database';

interface MeasureAttributes {
  id: number;
  customer_code: string;
  measure_datetime: Date;
  measure_type: string;
  measure_value: number;
  measure_uuid: string;
  confirmed_value: number | null;
  image_url?: string; 
}

interface MeasureCreationAttributes extends Optional<MeasureAttributes, 'id'> {}

export default class Measure extends Model<MeasureAttributes, MeasureCreationAttributes> implements MeasureAttributes {
  public id!: number;
  public customer_code!: string;
  public measure_datetime!: Date;
  public measure_type!: string;
  public measure_value!: number;
  public measure_uuid!: string;
  public confirmed_value!: number;
  public image_url?: string;

  public static initialize(sequelize: Sequelize) {
    Measure.init({
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,  // Define o campo como autoincremento
        primaryKey: true,      // Define o campo como chave primária
        allowNull: false       // Define o campo como não nulo
      },
      customer_code: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'O código do cliente não pode estar vazio.',
          }
        }
      },
      measure_datetime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      measure_type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'O tipo de medida não pode estar vazio.',
          }
        }
      },
      measure_value: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          isInt: {
            msg: 'O valor da medida precisa ser um número inteiro.',
          }
        }
      },
      measure_uuid: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'O UUID da medida não pode estar vazio.',
          }
        }
      },
      confirmed_value: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          isInt: {
            msg: 'O valor confirmado precisa ser um número inteiro.',
          }
        }
      },
      image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      }
    }, {
      sequelize,
      tableName: 'measures',
      indexes: [
        {
          unique: true,
          fields: ['measure_uuid']
        }
      ]
    });
  }
}


// Inicializa o modelo ao importar este arquivo
Measure.initialize(sequelize);