const { ObjectId } = require("mongodb");
const { start } = require('./clients');

// Db.collection('my-collection').aggregate([
//   {
//     $match: {
//       age: { $gte: 18 }
//     }
//   }, // stage 1 - осуществляем поиск
//   {
//     $project: {
//       name: 1,
//       age: 1
//     }
//   } // stage 2 - осуществляем проекцию
// ])

// $match, $project

// find().skip().limit()
// JOIN - как объеденить две коллекции?
// GROUP BY - find + aggregate + find(WHERE + GROUP BY + HAVING)

// Aggregation pipeline.
// 1.
// find() - это императивный подход.
// SELECT * FROM table - это императивный подход.
// 2. Концепция pipeline



// $match - аналог find в aggregation pipeline
// $project - проекция данных

// collection('users').aggregate([
//   {
//     $match: {
//       age: { $gte: 18 }
//     }, // stage 1 - мы фильтруем по условию
//     $project: {
//       name: 1,
//       age: 1
//     }, // stage 2 - мы проектируем
//   }
// ])

// collection('users').find({
//   year: { $gte: 18 }
// }, { 
//   name: 1, age: 1 
// });

// groupMoviesByYears();
// groupUnwindMovies();

// lookupUserComments();
lookupMoviesComments();
// lookupMoviesFilterComments();

// outMovies();

// $gte
// unwind - что значит?

async function groupMoviesByYears() {
  const { movies } = await start();

  db.movies.aggregate([
    {
      $match: {
        year: { $lte: 2000 }
      }
    },
    {
      $group: {
        "_id": {
          year: "$year",
          type: "$type"
        },

        count: { $sum: 1 },

        avgImdbRating: { $avg: '$imdb.rating' },
        minImdbRating: { $min: '$imdb.rating' },
        maxImdbRating: { $max: '$imdb.rating' }
      }
    },
    {
      $sort: {
        count: -1
      }
    },
    {
      $limit: 5
    },
    {
      $set: {
        year: '$_id.year',
        type: '$_id.type',
        avgImdbRating: { $round: ['$avgImdbRating', 2] }
      }
    }
  ])
  

  // db.movies.aggregate([
  //   {
  //     $match: {
  //       year: { $lte: 2000 }
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: '$year',

  //       count: { $sum: 1 },

  //       avgImdbRating: { $avg: '$imdb.rating' },
  //       minImdbRating: { $min: '$imdb.rating' },
  //       maxImdbRating: { $max: '$imdb.rating' }
  //     }
  //   },
  //   {
  //     $sort: {
  //       count: -1
  //     }
  //   },
  //   {
  //     $limit: 5
  //   },
  //   {
  //     $match: {
  //       avgImdbRating: { $gte: 6.5 }
  //     }
  //   },
  //   {
  //     $set: {
  //       avgImdbRating: { $round: ['$avgImdbRating', 2] }
  //     }
  //   }
  // ])





  // const res = await movies.collection('movies').aggregate([
  //   {
  //     $match: {
  //       year: { $gte: 2000 }
  //     }
  //   }, // Фильтрация данных, аналог WHERE
  //   {
  //     $group: {
  //       // При группировании два вида: колонки группирования, колонки аггрегации.

  //       _id: '$year', // Поля уникальный, по которым делается группирования

  //       // aggregation fields
  //       total: { $sum: 1 }, // Добавлять +1

  //       // Все фильмы в виде массива строк.
  //       // movies: { $push: '$title'}, // Добавить в массив значение

  //       // Average
  //       avgImdbRating: { $avg: '$imdb.rating' },
  //       minImdbRating: { $min: '$imdb.rating' },
  //       maxImdbRating: { $max: '$imdb.rating' }
  //     }
  //   }, // GROUP BY + SELECT
  //   {
  //     $match: {
  //       avgImdbRating: { $gte: 6.6 }
  //     }
  //   }, // Что-то в виде HAVING. Добавил ещё одну фильтрацию
  //   {
  //     $sort: {
  //       _id: 1
  //     }
  //   } // ORDER BY
  // ]).toArray();

  // console.log(res);
}

async function groupUnwindMovies() {
  const { movies } = await start();

  db.movies.aggregate([
    {
      $unwind: '$countries'
    },
    {
      $unwind: '$genres'
    },
    {
      $group: {
        _id: { $concat: ['$countries', '___', '$genres'] }, // массив строк

        total: { $sum: 1 },
      }
    },
    {
      $sort: {
        _id: -1
      }
    }
  ])

  db.movies.aggregate([
    {
      $unwind: '$countries'
    },
    {
      $unwind: '$genres'
    },
    {
      $group: {
        _id: { $concat: ['$countries', '___', '$genres'] }, // массив строк

        total: { $sum: 1 },
      }
    },
    {
      $sort: {
        _id: -1
      }
    }
  ])

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
    {
      $unwind: '$countries'
    },
    {
      $unwind: '$genres'
    },
    {
      $group: {
        _id: { $concat: ['$countries', '___', '$genres'] }, // массив строк
        total: { $sum: 1 },
      }
    },
    {
      $sort: {
        _id: -1
      }
    }
  ]).toArray();

  console.log(res);
}

async function lookupUserComments() {
  const { movies } = await start();

  // users - коллеция и хотим добавить comments
//   {
//     "_id" : ObjectId("59b99db7cfa9a34dcd7885bd"),
//     "name" : "Petyr Baelish",
//     "email" : "aidan_gillen@gameofthron.es",
//     "userComments": [
//       {

//       }
//     ]
// }

  db.users.aggregate([
    {
      $match: {
        _id: ObjectId('59b99dc5cfa9a34dcd7885d9')
      }
    },
    {
      $lookup: {
        from: 'comments', // коллекцию для присоденинения
        localField: 'name', // Что с чем сравниваем
        foreignField: 'name', // C каким полем сравниванем
        as: 'userComments' // Как будет называеться поле
      }
    },
    {
      $set: { userComments: { '$first': '$userComments' } }
    },
    {
      $set: { userComment: '$userComments.text' }
    }]);

  const res = await movies.collection('users').aggregate([
    {
      $match: {
        _id: ObjectId('59b99dc5cfa9a34dcd7885d9')
      }
    },
    {
      $lookup: {
        from: 'comments', // коллекцию для присоденинения
        localField: 'name', // Что с чем сравниваем
        foreignField: 'name', // C каким полем сравниванем
        as: 'userComments' // Как будет называеться поле
      }
    },
    {
      $set: { userComments: { '$first': '$userComments' } }
    },
    {
      $limit: 1
    },
    {
      $project: {
        password: 0
      }
    }
  ]).toArray();

  console.dir(res, { depth: 4 });
}

async function lookupMoviesComments() {
  const { movies } = await start();

  const res = await movies.collection('movies').aggregate([
    {
      $match: {
        _id: new ObjectId('573a1396f29313caabce4a9a')
      }
    },
    {
      $lookup: {
        from: 'comments', // Указываем коллекцию для объединения
        localField: '_id', // Указываем ключ в коллекции movies для объединения
        foreignField: 'movie_id', // Указываем ключ в коллекции comments JOIN comments cs ON movies.id = cs.movie_id
        as: 'comments' // как будем называть новое поле
      }
    },
    {
      $project: {
        _id: 1,
        title: 1,
        comments: 1
      }
    },
    {
      $limit: 1
    }
  ]).toArray();

  console.log(res[0]);
}

// update - deprecated
// updateOne, updateMany - 
// delete - 
// deleteOne, deleteMany

async function lookupMoviesFilterComments() {
  const { movies } = await start();

  const res = await movies.collection('movies').aggregate([
    {
      $match: {
        _id: new ObjectId('573a1396f29313caabce4a9a')
      }
    },
    {
      $lookup:
         {
           from: "comments", // Коллекцию подключить
           let: { movieId: "$_id" },
           pipeline: [
              { 
                $match: { 
                  $expr: { $eq: [ "$movie_id",  "$$movieId" ] }
                }
              },
              {
                $sort: {
                  date: -1
                }
              },
              {
                $limit: 10
              },
              {
                $project: {
                  movie_id: 0
                }
              }
           ],
           as: "comments"
      }
    },
    // {
    //   $unwind: '$comments'
    // },
    {
      $limit: 1
    }
  ]).toArray();

  console.log(res[0]);
}

async function outMovies() {
  const { movies } = await start();

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
    {
      $group: {
        _id: '$year',
        total: { $sum: 1 },
        movies: { $push: '$title'}
      }
    },
    {
      $sort: {
        _id: -1
      }
    },
    {
      $out: 'movies_group_by_year'
    }
  ]).toArray();

  console.log(res);
}


// Что будет ближе по духу: написать приложение или создавть инженерное решение как DBA.

// 1. CRUD API Server с бизнес задачей
// 2. DBA - создал кластер(репликация + шардирования), завернуть это или в k8s или в cloud.
// И проводите исследовательскую работу. Показать как кластер работает при падении сети/серверов.
// А как ведёт под нагрузкой.
// Собрали реплика сэт с версией mongodb 4.2 и как обновиться до версии 7.
// 3. Что-то своё придумать.
