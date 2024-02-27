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
  // movies - client.db('sample_mflix')

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/

  // {
  //   _id: 2011, // это год
  //   total: 1040,
  //   movies: [
  //     'The Rum Diary',
  //     'Gnomeo & Juliet',
  //     'The Crimson Petal and the White',
  //     'Cowboys & Aliens',
  //     'Real Steel',
  //     'Puss in Boots',
  //     'Captain America: The First Avenger',
  //     'Generation P',
  //     'Margaret',
  //     'Tower Heist',
  //     'The Smurfs',
  //     'The Mechanic',
  //     'Extremely Loud & Incredibly Close',
  //     'The Tree of Life',
  //     'Season of the Witch',
  //     'Atlas Shrugged: Part I',
  //     'Something Borrowed',
  //     'Samsara',
  //     'Drive',
  //     'Thor',
  //     'Red Dog',
  //     'Take Me Home Tonight',
  //     'Jack and Jill',
  //     'Conan the Barbarian',
  //     'Priest',
  //     'Hoodwinked Too! Hood vs. Evil',
  //     '6 Month Rule',
  //     'Red State',
  //     'Sanctum',
  //     'From Prada to Nada',
  //     'The Thing',
  //     'Black Butterflies',
  //     'Source Code',
  //     'A Monster in Paris',
  //     'Hugo',
  //     'The Adventures of Tintin',
  //     'Funkytown',
  //     'Sucker Punch',
  //     'The Green Hornet',
  //     'Hanna',
  //     'Straw Dogs',
  //     'The Iron Lady',
  //     'Asylum Blackout',
  //     'Inseparable',
  //     'The Descendants',
  //     'The Eagle',
  //     'Water for Elephants',
  //     'Monte Carlo',
  //     'Footloose',
  //     'Midnight Son',
  //     'Ghost Rider: Spirit of Vengeance',
  //     'A Princess for Christmas',
  //     'Megan Is Missing',
  //     'Paul',
  //     'The Darkest Hour',
  //     'George Harrison: Living in the Material World',
  //     'The Ides of March',
  //     'Here',
  //     'Green Lantern',
  //     'Sonny Boy',
  //     'Beastly',
  //     'The Rite',
  //     'Wuthering Heights',
  //     "Corman's World: Exploits of a Hollywood Rebel",
  //     'The Skin I Live In',
  //     'The Lincoln Lawyer',
  //     'Rango',
  //     'About Sunny',
  //     'Harry Potter and the Deathly Hallows: Part 2',
  //     'The Muppets',
  //     'Tyrannosaur',
  //     'Moneyball',
  //     'Bag of Bones',
  //     'Seeking Justice',
  //     'Seeking Justice',
  //     'Cars 2',
  //     'Battle Los Angeles',
  //     'Limitless',
  //     'Zookeeper',
  //     'African Cats',
  //     'Jane Eyre',
  //     'Mission: Impossible - Ghost Protocol',
  //     'Pariah',
  //     'Captain Thunder',
  //     'The Future',
  //     'Your Highness',
  //     'Father, Son & Holy Cow',
  //     'We Need to Talk About Kevin',
  //     'Sidewalls',
  //     'Bellflower',
  //     'Rebellion',
  //     'Judas Kiss',
  //     'Immortals',
  //     'Take Me Home',
  //     'Pig',
  //     'Scream 4',
  //     'The Roommate',
  //     'A Very Harold & Kumar 3D Christmas',
  //     "The Devil's Double",
  //     'Deadheads'
  //   ],
  //   avgImdbRating: 6.491538461538461,
  //   minImdbRating: 1.6,
  //   maxImdbRating: 9.2
  // }

  const res = await movies.collection('movies').aggregate([
    {
      $match: {
        year: { $gte: 2000 }
      }
    }, // Фильтрация данных, аналог WHERE
    {
      $group: {
        // При группировании два вида: колонки группирования, колонки аггрегации.

        _id: '$year', // Поля уникальный, по которым делается группирования

        // aggregation fields
        total: { $sum: 1 }, // Добавлять +1

        // Все фильмы в виде массива строк.
        // movies: { $push: '$title'}, // Добавить в массив значение

        // Average
        avgImdbRating: { $avg: '$imdb.rating' },
        minImdbRating: { $min: '$imdb.rating' },
        maxImdbRating: { $max: '$imdb.rating' }
      }
    }, // GROUP BY + SELECT
    {
      $match: {
        avgImdbRating: { $gte: 6.6 }
      }
    }, // Что-то в виде HAVING. Добавил ещё одну фильтрацию
    {
      $sort: {
        _id: 1
      }
    } // ORDER BY
  ]).toArray();

// {
//   $match: {
//     year: { $gte: 2000 }
//   }
// }, // WHERE $match - отфильтрую по годам
// {
//   $group: {
//     // При группировании два вида: колонки группирования, колонки аггрегации.

//     _id: '$year', // Поля уникальный, по которым делается группирования

//     // aggregation fields
//     total: { $sum: 1 }, // Добавлять +1

//     // Все фильмы в виде массива строк.
//     // movies: { $push: '$title'}, // Добавить в массив значение

//     // Average
//     avgImdbRating: { $avg: '$imdb.rating' },
//     minImdbRating: { $min: '$imdb.rating' },
//     maxImdbRating: { $max: '$imdb.rating' }
//   }
// }, // GROUP BY



  console.log(res);
}

async function groupUnwindMovies() {
  const { movies } = await start();

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
  const res = await movies.collection('users').aggregate([
    {
      $lookup: {
        from: 'comments', // коллекцию для присоденинения
        localField: 'name', // Что с чем сравниваем
        foreignField: 'name', // C каким полем сравниванем
        as: 'userComments' // Как будет называеться поле
      }
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
                $project: {
                  movie_id: 0
                }
              },
              {
                $limit: 1
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
