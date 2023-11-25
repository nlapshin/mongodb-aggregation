const { ObjectId } = require("mongodb");
const { start } = require('./clients');

// mapReduce()
// groupFunction()
// groupAccumulate()

// Необходимо:
// - построить шардированный кластер из 3 кластерных нод( по 3 инстанса с репликацией) и с кластером конфига(3 инстанса);
// - добавить балансировку, нагрузить данными, выбрать хороший ключ шардирования, посмотреть как данные перебалансируются между шардами;
// - поронять разные инстансы, посмотреть, что будет происходить, поднять обратно. Описать что произошло.

// * настроить аутентификацию и многоролевой доступ;

async function mapReduce() {
  const { movies } = await start();

  // Выполняются все на движке
  const mapFunction = function () {
    emit(this.year, 1);
  };

  const reduceFunction = function (key, values) {
    return Array.sum(values);
  };

  await movies.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "movies_per_year" //
    }
  );
}

// async function groupFunction() {
//     const { movies } = await start();

//     const fn = function(imdb, tomatoes) {
//       return ((imdb?.rating || 0) + (tomatoes?.viewer?.rating || 0) / 2)
//     };
  
//     // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
//     const res = await movies.collection('movies').aggregate([
//         {
//           $addFields: {
//             avgRating: { 
//               $function: {
//                   body: fn.toString(),
//                   // body: `function(imdb, tomatoes) {
//                   //   return ((imdb?.rating || 0) + (tomatoes?.viewer?.rating || 0) / 2)
//                   // }`,
//                   args: [ "$imdb", '$tomatoes' ],
//                   lang: "js"
//                }
//             },
//           }
//         }
//     ]).toArray()
  
//     console.log(res[0]);
// }

async function groupAccumulate() {
  const { movies } = await start();

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
      {
          $match: {
            directors: /Fincher/i,
          },
      },
      {
        $unwind: '$directors' 
      },
      {
        $group: {
          _id: "$directors",
          totalWinsSum: { $sum: '$awards.wins' },
          totalWinsAccumulator: {
            $accumulator: {
              init: `function() {
                return { totalWins: 0 };
              }`,
              accumulate: `function (state, awards) {
                  state.totalWins += awards?.wins || 0;
                  return state;
              }`,
              accumulateArgs: ['$awards'],
              initArgs: [],
              merge: `function (state1, state2) {
                  state1.totalWins += state2.totalWins;
                  return state1;
              }`,
              lang: 'js',
            }
          }
        }
      }
  ]).toArray()

  console.log(res);
}
