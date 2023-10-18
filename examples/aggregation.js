const { ObjectId } = require("mongodb");
const { start } = require('./clients');

// groupMoviesByYears();
// groupUnwindMovies();

// lookupUserComments()
// lookupMoviesComments();
// lookupMoviesFilterComments();

// outMovies();

async function groupMoviesByYears() {
  const { movies } = await start();

  // https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
  const res = await movies.collection('movies').aggregate([
    {
      $group: {
        _id: '$year',
        total: { $sum: 1 },
        movies: { $push: '$title'},
        avgImdbRating: { $avg: '$imdb.rating' },
        minImdbRating: { $min: "$imdb.rating"},
        maxImdbRating: { $max: "$imdb.rating"}
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
        _id: '$countries',
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
        from: 'comments',
        localField: 'name',
        foreignField: 'name',
        as: 'userComments'
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
           from: "comments",
           pipeline: [
              { 
                $match: {
                  date: { $gte: new Date("2000-01-01T00:00:00Z") }
                }
              }
           ],
           as: "comments"
      }
    },
    // {
    //   $limit: 1
    // }
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
