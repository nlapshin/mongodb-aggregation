const { ObjectId } = require("mongodb");
const { start } = require('./clients');

// const arr = [
//   {
//     year: '1920',
//     countries: ['USA', 'Russia', 'France']
//   }
// ]; // unwind;

// const unwindArr = [
//   {
//     year: '1920',
//     countries: 'USA'
//   },
//   {
//     year: '1920',
//     countries: 'Russia'
//   },
//   {
//     year: '1920',
//     countries: 'France'
//   },
// ]

// {
//   "_id" : ObjectId("573a1390f29313caabcd4eaf"),
//   "plot" : "A woman, with the aid of her police officer sweetheart, endeavors to uncover the prostitution ring that has kidnapped her sister, and the philanthropist who secretly runs it.",
//   "genres" : [ 
//       "Crime", 
//       "Drama"
//   ],
//   "runtime" : 88,
//   "cast" : [ 
//       "Jane Gail", 
//       "Ethel Grandin", 
//       "William H. Turner", 
//       "Matt Moore"
//   ],
//   "num_mflix_comments" : 2,
//   "poster" : "https://m.media-amazon.com/images/M/MV5BYzk0YWQzMGYtYTM5MC00NjM2LWE5YzYtMjgyNDVhZDg1N2YzXkEyXkFqcGdeQXVyMzE0MjY5ODA@._V1_SY1000_SX677_AL_.jpg",
//   "title" : "Traffic in Souls",
//   "lastupdated" : "2015-09-15 02:07:14.247000000",
//   "languages" : [ 
//       "English"
//   ],
//   "released" : ISODate("1913-11-24T00:00:00.000Z"),
//   "directors" : [ 
//       "George Loane Tucker"
//   ],
//   "rated" : "TV-PG",
//   "awards" : {
//       "wins" : 1,
//       "nominations" : 0,
//       "text" : "1 win."
//   },
//   "year" : "2000",
//   "imdb" : {
//       "rating" : 6,
//       "votes" : 371,
//       "id" : 3471
//   },
//   "countries" : [ 
//       "USA"
//   ],
//   "type" : "movie",
//   "tomatoes" : {
//       "viewer" : {
//           "rating" : 3,
//           "numReviews" : 85,
//           "meter" : 57
//       },
//       "dvd" : ISODate("2008-08-26T00:00:00.000Z"),
//       "lastUpdated" : ISODate("2015-08-10T18:33:55.000Z")
//   }
// }


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

// groupMoviesByYears();
// groupUnwindMovies();

// lookupUserComments()
// lookupMoviesComments();
// lookupMoviesFilterComments();

// outMovies();

// Группирование - разобрали
// JOIN - lookup
// Транзации - они появились в версия 4.2+

async function groupMoviesByYears() {
  const { movies } = await start();

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
    {
      $match: {
        year: { $gte: 2000 }
      }
    },
    {
      $group: {
        _id: '$year', // Поля уникальный, по которым делается группирования

        // aggregation fields
        total: { $sum: 1 }, // Добавлять +1

        // Все фильмы в виде массива строк.
        movies: { $push: '$title'}, // Добавить в массив значение

        // Average
        avgImdbRating: { $avg: '$imdb.rating' },
        minImdbRating: { $min: '$imdb.rating' },
        maxImdbRating: { $max: '$imdb.rating' }
      }
    },
    {
      $match: {
        avgImdbRating: { $gte: 8 }
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

async function groupUnwindMovies() {
  const { movies } = await start();

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
    {
      $unwind: '$countries'
    },
    {
      $group: {
        _id: '$countries', // массив строк
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

  console.log(res[0]);
}

async function lookupMoviesComments() {
  const { movies } = await start();

  const res = await movies.collection('movies').aggregate([
    {
      $lookup: {
        from: 'comments',
        localField: '_id',
        foreignField: 'movie_id',
        as: 'comments'
      }
    },
    {
      $limit: 1
    }
  ]).toArray();

  console.log(res[0]);
}

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
              }
           ],
           as: "comments"
      }
    },
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
      $out: 'groupMovies'
    }
  ]).toArray();

  console.log(res);
}
