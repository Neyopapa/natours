const multer = require('multer');
const sharp = require('sharp');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! please upload only images', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`),
// );

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // Cover images
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.field = 'name, summary, ratingsAverage, price, difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitField()
//     .paginate();
//   const tours = await features.query;

//   // const query = Tour.find()
//   //   .where('duration')
//   //   .equals(5)
//   //   .where('difficulty')
//   //   .equals('easy');

//   // SEND RESPONSE
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });

//   //   try {
//   //     console.log(req.query);
//   //     // BUILD QUERY
//   //     // 1A) Filtering
//   //     // const queryObj = { ...req.query };
//   //     // const excludedFields = ['page', 'sort', 'limit', 'field'];
//   //     // excludedFields.forEach((el) => delete queryObj[el]);

//   //     // //  1B) Advance Filtering
//   //     // let queryStr = JSON.stringify(queryObj);
//   //     // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
//   //     // console.log(JSON.parse(queryStr));

//   //     // // { difficulty: 'easy', duration: { gte: 5 } }
//   //     // // { difficulty: 'easy', duration: { gte: '5' } }
//   //     // // gte, gt, lte, lt

//   //     // let query = Tour.find(JSON.parse(queryStr));

//   //     // 2)
//   //     // if (req.query.sort) {
//   //     //   const sortBy = req.query.sort.split(',').join(' ');
//   //     //   query = query.sort(sortBy);
//   //     // } else {
//   //     //   query = query.sort('-createdAt');
//   //     // }

//   //     // 3) Fields Limiting
//   //     // if (req.query.field) {
//   //     //   const field = req.query.field.split(',').join(' ');
//   //     //   query = query.select(field);
//   //     // } else {
//   //     //   query = query.select('-__v');
//   //     // }

//   //     // 4) Pagination
//   //     // const page = req.query.page * 1 || 1;
//   //     // const limit = req.query.limit * 1 || 100;
//   //     // const skip = (page - 1) * limit;

//   //     // query = query.skip(skip).limit(limit);

//   // EXECUTE QUERY
//   // const features = new APIFeatures(Tour.find(), req.query)
//   // .filter()
//   // .sort()
//   // .limitField()
//   // .paginate();
//   // const tours = await features.query;

//   // // const query = Tour.find()
//   // //   .where('duration')
//   // //   .equals(5)
//   // //   .where('difficulty')
//   // //   .equals('easy');

//   // // SEND RESPONSE
//   // res.status(200).json({
//   // status: 'success',
//   // results: tours.length,
//   // data: {
//   //   tours,
//   // },
//   // });

//   // //   } catch (err) {

//   // //   }
// });

exports.getTour = factory.getOne(Tour, { path: 'reviews' });
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // Tour.findOne({ _id = req.params.id })

//   if (!tour) {
//     return next(new AppError('No tour found with this ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });

// try {
//   const tour = await Tour.findById(req.params.id);
//   // Tour.findOne({ _id = req.params.id })
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// } catch (err) {
//   res.status(404).json({
//     status: 'fail',
//     message: 'err',
//   });
// }
// });

exports.createTour = factory.createOne(Tour);
// exports.createTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tours: newTour,
//     },
//   });
// });

exports.updateTour = factory.updateOne(Tour);
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with this ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// });

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with this ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });

// try {
//   await Tour.findByIdAndDelete(req.params.id);

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// } catch (err) {
//   res.status(404).json({
//     status: 'fail',
//     message: err,
//   });
// }
// });

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });

  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } },
  //     },
  //     {
  //       $group: {
  //         _id: { $toUpper: '$difficulty' },
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' },
  //       },
  //     },
  //     {
  //       $sort: { avgPrice: 1 },
  //     },
  //     // {
  //     //   $match: { _id: { $ne: 'EASY' } },
  //     // },
  //   ]);

  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       stats,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; // 2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });

  // try {
  //   const year = req.params.year * 1; // 2021

  //   const plan = await Tour.aggregate([
  //     {
  //       $unwind: '$startDates',
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`),
  //         },
  //       },
  //     },
  //     {
  //       $group: {
  //         _id: { $month: '$startDates' },
  //         numTourStarts: { $sum: 1 },
  //         tours: { $push: '$name' },
  //       },
  //     },
  //     {
  //       $addFields: { month: '$_id' },
  //     },
  //     {
  //       $project: {
  //         _id: 0,
  //       },
  //     },
  //     {
  //       $sort: { numTourStarts: -1 },
  //     },
  //     {
  //       $limit: 12,
  //     },
  //   ]);

  //   res.status(200).json({
  //     status: 'success',
  //     data: {
  //       plan,
  //     },
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err,
  //   });
  // }
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111745,-118.113491/unit/mi

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400,
      ),
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lng',
        400,
      ),
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
