1. Shard сервера
- CPU 8+
- mem 8-16
- free space сколько нужно под шарды 300-500.
2. Config Server
- CPU 4
- mem 4-8
- free space. 30 Гб, но лучши SSD
2. Mongos(балансировщик)
- CPU 4
- mem 4-8
- free space. 30 Гб, но лучши SSD



https://github.com/nlapshin/mongodb-aggregation


Я сегодня показываю примеры IDE.

- Кто знаком с понятием pipe в Linux?

history | grep mongosh > out


Какую проблему решаем профилирование, зачем оно нам?

- Решаем задачу отлеживания медленных запросов при помощи инструмента.
- Мы хотим мониторить это каким-то образом.
- Различные оптимизации.

Как решить проблему с оптимизацией?

- индексы. Индесы отдельная сущность - оно занимает, плюс накладные расходы при обновление.
- Кэширование + MongoDB In-memory.
- Не стоит тащить все данные из баз данных.

{
    op: 'command',
    ns: 'sample_mflix.movies',
    command: {
      explain: { find: 'movies', filter: { year: '2000' } },
      verbosity: 'executionStats',
      lsid: { id: new UUID("90aed6f6-4f26-4312-bcb4-29f8a8a29b22") },
      '$db': 'sample_mflix'
    },
    numYield: 0,
    queryHash: '412E8B51',
    queryFramework: 'classic',
    locks: {
      FeatureCompatibilityVersion: { acquireCount: { r: Long("1") } },
      Global: { acquireCount: { r: Long("1") } },
      Mutex: { acquireCount: { r: Long("1") } }
    },
    flowControl: {},
    responseLength: 2048,
    protocol: 'op_msg',
    millis: 0,
    ts: ISODate("2023-10-21T07:37:41.109Z"),
    client: '172.28.0.1',
    appName: 'mongosh 2.0.1',
    allUsers: [],
    user: ''
  }


{
  explainVersion: '1',
  queryPlanner: {
    namespace: 'sample_mflix.movies',
    indexFilterSet: false,
    parsedQuery: { year: { '$eq': 2000 } },
    queryHash: '412E8B51',
    planCacheKey: '412E8B51',
    maxIndexedOrSolutionsReached: false,
    maxIndexedAndSolutionsReached: false,
    maxScansToExplodeReached: false,
    winningPlan: {
      stage: 'COLLSCAN',
      filter: { year: { '$eq': 2000 } },
      direction: 'forward'
    },
    rejectedPlans: []
  },
  executionStats: {
    executionSuccess: true,
    nReturned: 618,
    executionTimeMillis: 12,
    totalKeysExamined: 0,
    totalDocsExamined: 23540,
    executionStages: {
      stage: 'COLLSCAN',
      filter: { year: { '$eq': 2000 } },
      nReturned: 618,
      executionTimeMillisEstimate: 1,
      works: 23542,
      advanced: 618,
      needTime: 22923,
      needYield: 0,
      saveState: 23,
      restoreState: 23,
      isEOF: 1,
      direction: 'forward',
      docsExamined: 23540
    },
    allPlansExecution: []
  },
  command: { find: 'movies', filter: { year: 2000 }, '$db': 'sample_mflix' },
  serverInfo: {
    host: 'fde0b86fe482',
    port: 27017,
    version: '6.0.6',
    gitVersion: '26b4851a412cc8b9b4a18cdb6cd0f9f642e06aa7'
  },
  serverParameters: {
    internalQueryFacetBufferSizeBytes: 104857600,
    internalQueryFacetMaxOutputDocSizeBytes: 104857600,
    internalLookupStageIntermediateDocumentMaxSizeBytes: 104857600,
    internalDocumentSourceGroupMaxMemoryBytes: 104857600,
    internalQueryMaxBlockingSortMemoryUsageBytes: 104857600,
    internalQueryProhibitBlockingMergeOnMongoS: 0,
    internalQueryMaxAddToSetBytes: 104857600,
    internalDocumentSourceSetWindowFieldsMaxMemoryBytes: 104857600
  },
  ok: 1
}


{
  explainVersion: '1',
  queryPlanner: {
    namespace: 'sample_mflix.movies',
    indexFilterSet: false,
    parsedQuery: { year: { '$eq': 2000 } },
    queryHash: '412E8B51',
    planCacheKey: '62915BA3',
    maxIndexedOrSolutionsReached: false,
    maxIndexedAndSolutionsReached: false,
    maxScansToExplodeReached: false,
    winningPlan: {
      stage: 'FETCH',
      inputStage: {
        stage: 'IXSCAN',
        keyPattern: { year: -1 },
        indexName: 'year_-1',
        isMultiKey: false,
        multiKeyPaths: { year: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { year: [ '[2000, 2000]' ] }
      }
    },
    rejectedPlans: []
  },
  executionStats: {
    executionSuccess: true,
    nReturned: 618,
    executionTimeMillis: 1,
    totalKeysExamined: 618,
    totalDocsExamined: 618,
    executionStages: {
      stage: 'FETCH',
      nReturned: 618,
      executionTimeMillisEstimate: 0,
      works: 619,
      advanced: 618,
      needTime: 0,
      needYield: 0,
      saveState: 0,
      restoreState: 0,
      isEOF: 1,
      docsExamined: 618,
      alreadyHasObj: 0,
      inputStage: {
        stage: 'IXSCAN',
        nReturned: 618,
        executionTimeMillisEstimate: 0,
        works: 619,
        advanced: 618,
        needTime: 0,
        needYield: 0,
        saveState: 0,
        restoreState: 0,
        isEOF: 1,
        keyPattern: { year: -1 },
        indexName: 'year_-1',
        isMultiKey: false,
        multiKeyPaths: { year: [] },
        isUnique: false,
        isSparse: false,
        isPartial: false,
        indexVersion: 2,
        direction: 'forward',
        indexBounds: { year: [ '[2000, 2000]' ] },
        keysExamined: 618,
        seeks: 1,
        dupsTested: 0,
        dupsDropped: 0
      }
    },
    allPlansExecution: []
  },
  command: { find: 'movies', filter: { year: 2000 }, '$db': 'sample_mflix' },
  serverInfo: {
    host: 'fde0b86fe482',
    port: 27017,
    version: '6.0.6',
    gitVersion: '26b4851a412cc8b9b4a18cdb6cd0f9f642e06aa7'
  },
  serverParameters: {
    internalQueryFacetBufferSizeBytes: 104857600,
    internalQueryFacetMaxOutputDocSizeBytes: 104857600,
    internalLookupStageIntermediateDocumentMaxSizeBytes: 104857600,
    internalDocumentSourceGroupMaxMemoryBytes: 104857600,
    internalQueryMaxBlockingSortMemoryUsageBytes: 104857600,
    internalQueryProhibitBlockingMergeOnMongoS: 0,
    internalQueryMaxAddToSetBytes: 104857600,
    internalDocumentSourceSetWindowFieldsMaxMemoryBytes: 104857600
  },
  ok: 1
}
