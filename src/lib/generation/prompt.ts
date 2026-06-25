// ─────────────────────────────────────────────────────────
//  lib/generation/prompt.ts
//  Feature catalog, input sanitizer, and Gemini prompt builder.
//  Imported by both FeatureSelector (UI) and generateProject (Server Action).
// ─────────────────────────────────────────────────────────

// ── Types ──────────────────────────────────────────────────

export type Architecture = 'mvvm' | 'clean'
export type UILayer = 'xml' | 'compose'
export type FeatureTier = 'free' | 'pro'

export type Feature = {
  id: string
  label: string
  description: string
  tier: FeatureTier
}

export type GenerationInput = {
  projectName: string
  features: string[]
  architecture: Architecture
  uiLayer: UILayer
}

export type GeneratedFile = {
  path: string
  content: string
}

// ── Feature Catalog ────────────────────────────────────────
// Single source of truth for both the UI (FeatureSelector)
// and the Gemini prompt builder.

export const FEATURE_CATALOG: Feature[] = [
  {
    id: 'retrofit',
    label: 'Retrofit',
    description: 'HTTP networking with OkHttp3 + Gson',
    tier: 'free',
  },
  {
    id: 'room',
    label: 'Room Database',
    description: 'SQLite ORM — Entity, DAO, AppDatabase',
    tier: 'free',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Notification channels + helper class',
    tier: 'free',
  },
  {
    id: 'firebase',
    label: 'Firebase',
    description: 'Analytics + google-services setup',
    tier: 'free',
  },
  {
    id: 'hilt',
    label: 'Hilt DI',
    description: 'Dependency injection with @HiltAndroidApp',
    tier: 'free',
  },
  {
    id: 'room_full',
    label: 'Room (Full)',
    description: 'Migrations, TypeConverters, complex queries',
    tier: 'pro',
  },
  {
    id: 'cicd',
    label: 'GitHub Actions',
    description: 'CI/CD workflow for build and test',
    tier: 'pro',
  },
  {
    id: 'multi_module',
    label: 'Multi-Module',
    description: 'Feature-based Gradle module structure',
    tier: 'pro',
  },
]

export const FREE_FEATURES = FEATURE_CATALOG.filter(f => f.tier === 'free')
export const PRO_FEATURES = FEATURE_CATALOG.filter(f => f.tier === 'pro')

const VALID_FEATURE_IDS = new Set(FEATURE_CATALOG.map(f => f.id))
const VALID_ARCHITECTURES: Set<string> = new Set(['mvvm', 'clean'])
const VALID_UI_LAYERS: Set<string> = new Set(['xml', 'compose'])

// ── Input Sanitizer ────────────────────────────────────────
// Call this in the Server Action before buildGenerationPrompt.
// Throws on invalid input — catches prompt injection attempts.

export function sanitizeInput(raw: GenerationInput): GenerationInput {
  const projectName = raw.projectName.trim()

  if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(projectName)) {
    throw new Error(
      'Project name must start with a letter and contain only letters, numbers, and underscores.',
    )
  }
  if (projectName.length < 2 || projectName.length > 50) {
    throw new Error('Project name must be between 2 and 50 characters.')
  }

  if (!VALID_ARCHITECTURES.has(raw.architecture)) {
    throw new Error('Invalid architecture selection.')
  }
  if (!VALID_UI_LAYERS.has(raw.uiLayer)) {
    throw new Error('Invalid UI layer selection.')
  }

  // Whitelist feature IDs — silently drop unknown or injected values
  const features = raw.features.filter(id => VALID_FEATURE_IDS.has(id))

  return {
    projectName,
    features,
    architecture: raw.architecture,
    uiLayer: raw.uiLayer,
  }
}

// ── Prompt Builder ─────────────────────────────────────────
// Returns the full Gemini prompt string for a generation request.
// The Server Action passes this directly to getGenerationModel().generateContent().

export function buildGenerationPrompt(input: GenerationInput): string {
  const { projectName, features, architecture, uiLayer } = input

  const pkg = `com.example.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
  const srcRoot = `app/src/main/kotlin/${pkg.replace(/\./g, '/')}`

  const isCompose = uiLayer === 'compose'
  const isClean = architecture === 'clean'
  const hasHilt = features.includes('hilt')
  const hasRetrofit = features.includes('retrofit')
  const hasRoom = features.includes('room') && !features.includes('room_full')
  const hasRoomFull = features.includes('room_full')
  const hasAnyRoom = hasRoom || hasRoomFull
  const hasNotifications = features.includes('notifications')
  const hasFirebase = features.includes('firebase')
  const hasCiCd = features.includes('cicd')
  const hasMultiModule = features.includes('multi_module')

  // Application class is required when using Hilt, Firebase, or Notifications
  const needsAppClass = hasHilt || hasFirebase || hasNotifications
  const appClassName = needsAppClass ? `${projectName}Application` : null

  return `You are a senior Android developer. Generate a complete, production-ready Android Studio Kotlin project that MUST compile and run on the first try in Android Studio without any changes.

═══════════════════════════════════════
PROJECT SPECIFICATION
═══════════════════════════════════════
Project name:  ${projectName}
Package name:  ${pkg}
Architecture:  ${isClean ? 'Clean Architecture (Presentation / Domain / Data layers)' : 'MVVM (ViewModel + Repository)'}
UI layer:      ${isCompose ? 'Jetpack Compose with Material3' : 'XML Layouts with ViewBinding and Material3'}
Features:      ${features.length === 0 ? 'none — base scaffold only' : features.join(', ')}

═══════════════════════════════════════
ABSOLUTE RULES — NEVER VIOLATE
═══════════════════════════════════════
1. ALL source code MUST be Kotlin. Do not write a single line of Java.
2. ALL build files MUST be Kotlin DSL (*.kts). Never use Groovy (*.gradle).
3. Use Gradle Version Catalog at gradle/libs.versions.toml for ALL dependencies.
4. Use EXACTLY these pinned versions — no substitutions:
   - AGP:                    8.2.2
   - Kotlin:                 1.9.24
   - Gradle wrapper:         8.6   (gradle-8.6-bin.zip)
   - compileSdk / targetSdk: 34    (must be INTEGER, not string "34")
   - minSdk:                 24
${isCompose ? '   - Compose BOM:           2024.02.00' : ''}
${hasAnyRoom ? '   - Room:                  2.6.1' : ''}
${hasRetrofit ? '   - Retrofit:              2.9.0\n   - OkHttp BOM:           4.12.0' : ''}
${hasHilt ? '   - Hilt:                  2.51.1' : ''}
${hasFirebase ? '   - Firebase BOM:          32.7.4' : ''}
5. Every Kotlin file MUST have the correct package declaration on the first line.
6. Every file MUST be 100% complete — no ellipsis, no "// ... rest of code", no truncation.
7. No deprecated APIs. No Material2 — use Material3 only.
8. AndroidManifest <application> tag MUST include android:name=".${appClassName ?? 'android.app.Application'}".
9. If using ViewBinding: enable buildFeatures { viewBinding = true } in app/build.gradle.kts.
10. If using Compose: use ComponentActivity (NOT AppCompatActivity) as the base class for MainActivity.

═══════════════════════════════════════
GRADLE FILE SPECIFICATIONS
═══════════════════════════════════════

settings.gradle.kts — MUST contain:
  pluginManagement {
    repositories {
      google { content {
        includeGroupByRegex("com\\.android.*")
        includeGroupByRegex("com\\.google.*")
        includeGroupByRegex("androidx.*")
      } }
      mavenCentral()
      gradlePluginPortal()
    }
  }
  dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories { google(); mavenCentral() }
  }
  rootProject.name = "${projectName}"
  include(":app"${hasMultiModule ? ', ":core"' : ''})

build.gradle.kts (root) — plugins block ONLY, nothing else:
  plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false${isCompose ? '\n    alias(libs.plugins.kotlin.compose) apply false' : ''}${hasHilt ? '\n    alias(libs.plugins.hilt) apply false' : ''}${hasFirebase ? '\n    alias(libs.plugins.google.services) apply false' : ''}
  }

app/build.gradle.kts — must include:
  - plugins: android.application + kotlin.android${isCompose ? ' + kotlin.compose' : ''}${hasHilt ? ' + kapt + hilt' : ''}${hasFirebase ? ' + google.services' : ''}
  - android { compileSdk = 34; defaultConfig { applicationId = "${pkg}"; minSdk = 24; targetSdk = 34 }; buildFeatures { ${isCompose ? 'compose = true' : 'viewBinding = true'} }; compileOptions { sourceCompatibility = JavaVersion.VERSION_1_8; targetCompatibility = JavaVersion.VERSION_1_8 }; kotlinOptions { jvmTarget = "1.8" } }
  - All dependencies use libs.xxx catalog aliases only

gradle/libs.versions.toml — complete version catalog:
  [versions]: agp, kotlin${isCompose ? ', composeBom' : ''}${hasAnyRoom ? ', room' : ''}${hasRetrofit ? ', retrofit, okhttp' : ''}${hasHilt ? ', hilt' : ''}${hasFirebase ? ', firebaseBom' : ''}
  [libraries]: ALL dependency declarations — must include core-ktx, appcompat, material3, activity${isCompose ? ', compose-bom, compose-ui, compose-ui-tooling-preview, compose-material3, activity-compose, lifecycle-viewmodel-compose, lifecycle-runtime-ktx' : ', constraintlayout, lifecycle-viewmodel-ktx, lifecycle-runtime-ktx'}
  [plugins]: android-application, kotlin-android${isCompose ? ', kotlin-compose' : ''}${hasHilt ? ', hilt, kapt' : ''}${hasFirebase ? ', google-services' : ''}

gradle/wrapper/gradle-wrapper.properties:
  distributionBase=GRADLE_USER_HOME
  distributionPath=wrapper/dists
  distributionUrl=https\\://services.gradle.org/distributions/gradle-8.6-bin.zip
  zipStoreBase=GRADLE_USER_HOME
  zipStorePath=wrapper/dists

═══════════════════════════════════════
ARCHITECTURE
═══════════════════════════════════════
${buildArchitectureSection(isClean, isCompose, srcRoot, pkg, projectName, hasHilt)}

═══════════════════════════════════════
FEATURE IMPLEMENTATIONS
═══════════════════════════════════════
${buildFeatureSection(features, projectName, pkg, srcRoot, isClean)}

═══════════════════════════════════════
REQUIRED FILE LIST (minimum)
═══════════════════════════════════════
Generate AT LEAST these files (plus all feature-required files):
- settings.gradle.kts
- build.gradle.kts
- app/build.gradle.kts
- gradle/libs.versions.toml
- gradle/wrapper/gradle-wrapper.properties
- app/src/main/AndroidManifest.xml
- app/src/main/res/values/strings.xml
- app/src/main/res/values/themes.xml
- app/src/main/res/values/colors.xml${!isCompose ? '\n- app/src/main/res/layout/activity_main.xml' : ''}
- ${srcRoot}/MainActivity.kt${appClassName ? `\n- ${srcRoot}/${appClassName}.kt` : ''}
${buildRequiredFileList(isClean, isCompose, srcRoot, hasHilt)}

═══════════════════════════════════════
OUTPUT FORMAT — CRITICAL
═══════════════════════════════════════
Your ENTIRE response must be a single raw JSON array. No markdown. No code fences. No explanatory text before or after the JSON. Just the array.

Schema: [{"path":"<relative path from project root>","content":"<complete file content>"}]

Rules:
- path: forward slashes, relative to project root (e.g. "app/src/main/kotlin/com/example/myapp/MainActivity.kt")
- content: COMPLETE file content as a single JSON string — use \\n for newlines, escape \\ as \\\\
- NEVER truncate or abbreviate content — every file must be fully implemented and syntactically valid Kotlin/XML/TOML/properties

Generate the complete project now.`
}

// ── Private helpers ────────────────────────────────────────

function buildArchitectureSection(
  isClean: boolean,
  isCompose: boolean,
  srcRoot: string,
  pkg: string,
  projectName: string,
  hasHilt: boolean,
): string {
  const injectAnnotation = hasHilt ? '@Inject constructor' : 'constructor'
  const mainActivityBase = isCompose ? 'ComponentActivity' : 'AppCompatActivity'
  const viewModelAnnotation = hasHilt ? '@HiltViewModel\nclass' : 'class'
  const entryPoint = hasHilt ? '\n@AndroidEntryPoint' : ''

  if (isClean) {
    return `Clean Architecture — strict dependency rule: outer layers depend on inner layers, never the reverse.

PRESENTATION (${srcRoot}/presentation/):
- viewmodel/MainViewModel.kt
  ${viewModelAnnotation} MainViewModel ${injectAnnotation}(
    private val getSampleDataUseCase: GetSampleDataUseCase
  ) : ViewModel() {
    private val _uiState = MutableStateFlow<MainUiState>(MainUiState.Loading)
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()
    init { loadData() }
    private fun loadData() { viewModelScope.launch {
      _uiState.value = getSampleDataUseCase().fold(
        onSuccess = { MainUiState.Success(it) },
        onFailure = { MainUiState.Error(it.message ?: "Unknown error") }
      )
    } }
  }
  sealed interface MainUiState {
    data object Loading : MainUiState
    data class Success(val data: SampleData) : MainUiState
    data class Error(val message: String) : MainUiState
  }
${entryPoint}
- MainActivity.kt: extends ${mainActivityBase}${isCompose
  ? ', calls setContent { MaterialTheme { MainScreen(viewModel = viewModels<MainViewModel>()) } }'
  : ', uses ViewBinding, observes uiState with lifecycleScope.launch + repeatOnLifecycle(Lifecycle.State.STARTED)'}
${isCompose ? `- screen/MainScreen.kt: @Composable fun, val state by viewModel.uiState.collectAsStateWithLifecycle(), renders Loading/Success/Error states with Text and CircularProgressIndicator` : ''}

DOMAIN (${srcRoot}/domain/) — pure Kotlin only, zero Android imports:
- model/SampleData.kt: data class SampleData(val id: Int, val title: String, val description: String)
- repository/SampleRepository.kt: interface SampleRepository { suspend fun getSampleData(): Result<SampleData> }
- usecase/GetSampleDataUseCase.kt:
  class GetSampleDataUseCase ${injectAnnotation}(private val repository: SampleRepository) {
    suspend operator fun invoke(): Result<SampleData> = repository.getSampleData()
  }

DATA (${srcRoot}/data/):
- source/SampleDataSource.kt: class SampleDataSource ${injectAnnotation}() { suspend fun fetch(): SampleData { delay(300); return SampleData(1, "Hello from Blacksmith", "Your project is ready.") } }
- repository/SampleRepositoryImpl.kt: ${hasHilt ? '@Singleton\nclass SampleRepositoryImpl @Inject constructor' : 'class SampleRepositoryImpl('}(private val dataSource: SampleDataSource) : SampleRepository { override suspend fun getSampleData() = runCatching { dataSource.fetch() } }
${hasHilt ? `
DI (${srcRoot}/di/AppModule.kt):
@Module @InstallIn(SingletonComponent::class)
abstract class AppModule {
  @Binds @Singleton
  abstract fun bindSampleRepository(impl: SampleRepositoryImpl): SampleRepository
  companion object {
    @Provides @Singleton
    fun provideSampleDataSource(): SampleDataSource = SampleDataSource()
  }
}` : ''}`
  }

  return `MVVM — ViewModel + Repository pattern.

MainViewModel (${srcRoot}/viewmodel/MainViewModel.kt):
  ${viewModelAnnotation} MainViewModel ${injectAnnotation}(
    private val repository: MainRepository
  ) : ViewModel() {
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()
    init { loadData() }
    fun loadData() { viewModelScope.launch {
      _uiState.update { it.copy(isLoading = true, error = null) }
      repository.getSampleData().fold(
        onSuccess = { data -> _uiState.update { it.copy(isLoading = false, data = data) } },
        onFailure = { e  -> _uiState.update { it.copy(isLoading = false, error = e.message) } }
      )
    } }
  }
  data class MainUiState(val isLoading: Boolean = true, val data: SampleData? = null, val error: String? = null)
  data class SampleData(val id: Int, val title: String, val description: String)

MainRepository (${srcRoot}/data/repository/MainRepository.kt):
  class MainRepository ${injectAnnotation}() {
    suspend fun getSampleData(): Result<SampleData> = runCatching {
      delay(300); SampleData(1, "Hello from Blacksmith", "Your project is ready.")
    }
  }
${entryPoint}
MainActivity (${srcRoot}/MainActivity.kt):
  extends ${mainActivityBase}
  val viewModel: MainViewModel by viewModels()
  ${isCompose
    ? 'setContent { MaterialTheme { MainScreen(viewModel = viewModel) } }'
    : 'uses ViewBinding; lifecycleScope.launch { repeatOnLifecycle(STARTED) { viewModel.uiState.collect { /* update UI */ } } }'}
${isCompose ? `
MainScreen (${srcRoot}/ui/MainScreen.kt):
  @Composable fun MainScreen(viewModel: MainViewModel) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    // Show CircularProgressIndicator when isLoading, Text for data/error
  }` : ''}
${hasHilt ? `
DI (${srcRoot}/di/AppModule.kt):
@Module @InstallIn(SingletonComponent::class)
object AppModule {
  @Provides @Singleton
  fun provideMainRepository(): MainRepository = MainRepository()
}` : ''}`
}

function buildFeatureSection(
  features: string[],
  projectName: string,
  pkg: string,
  srcRoot: string,
  isClean: boolean,
): string {
  if (features.length === 0) return 'No additional features selected. Generate minimal base scaffold only.'

  const localDir = isClean ? 'data/source/local' : 'data/local'
  const remoteDir = isClean ? 'data/source/remote' : 'data/remote'
  const hasRoomFull = features.includes('room_full')
  const parts: string[] = []

  if (features.includes('retrofit')) {
    parts.push(`RETROFIT + OKHTTP3:
New files:
- ${srcRoot}/${remoteDir}/dto/PostDto.kt — data class PostDto(@SerializedName("id") val id: Int, @SerializedName("userId") val userId: Int, @SerializedName("title") val title: String, @SerializedName("body") val body: String)
- ${srcRoot}/${remoteDir}/ApiService.kt — Retrofit @GET("posts") interface returning List<PostDto>; @GET("posts/{id}") returning PostDto
- ${srcRoot}/${remoteDir}/RetrofitClient.kt — object with lazy OkHttpClient (10s timeouts, HttpLoggingInterceptor BODY in debug) + Retrofit.Builder(baseUrl = "https://jsonplaceholder.typicode.com/").addConverterFactory(GsonConverterFactory.create()).build()

Gradle (version catalog additions):
  [versions]: retrofit = "2.9.0"; okhttp = "4.12.0"
  [libraries]:
    retrofit = { group = "com.squareup.retrofit2", name = "retrofit", version.ref = "retrofit" }
    retrofit-converter-gson = { group = "com.squareup.retrofit2", name = "converter-gson", version.ref = "retrofit" }
    okhttp-bom = { group = "com.squareup.okhttp3", name = "okhttp-bom", version.ref = "okhttp" }
    okhttp = { group = "com.squareup.okhttp3", name = "okhttp" }
    okhttp-logging = { group = "com.squareup.okhttp3", name = "logging-interceptor" }

app/build.gradle.kts dependencies:
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.gson)
    implementation(platform(libs.okhttp.bom))
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging)

AndroidManifest: <uses-permission android:name="android.permission.INTERNET" />`)
  }

  if (features.includes('room') && !hasRoomFull) {
    parts.push(`ROOM DATABASE (BASIC):
New files:
- ${srcRoot}/${localDir}/entity/Note.kt:
  @Entity(tableName = "notes")
  data class Note(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val title: String,
    val body: String,
    val createdAt: Long = System.currentTimeMillis()
  )
- ${srcRoot}/${localDir}/dao/NoteDao.kt:
  @Dao interface NoteDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insertNote(note: Note)
    @Query("SELECT * FROM notes ORDER BY createdAt DESC") fun getAllNotes(): Flow<List<Note>>
    @Delete suspend fun deleteNote(note: Note)
    @Update suspend fun updateNote(note: Note)
  }
- ${srcRoot}/${localDir}/AppDatabase.kt:
  @Database(entities = [Note::class], version = 1, exportSchema = false)
  abstract class AppDatabase : RoomDatabase() {
    abstract fun noteDao(): NoteDao
    companion object {
      @Volatile private var INSTANCE: AppDatabase? = null
      fun getInstance(context: Context): AppDatabase = INSTANCE ?: synchronized(this) {
        Room.databaseBuilder(context, AppDatabase::class.java, "blacksmith_notes.db").build().also { INSTANCE = it }
      }
    }
  }

Gradle:
  [versions]: room = "2.6.1"
  [libraries]:
    room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
    room-ktx     = { group = "androidx.room", name = "room-ktx",     version.ref = "room" }
    room-compiler= { group = "androidx.room", name = "room-compiler", version.ref = "room" }

app/build.gradle.kts:
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    kapt(libs.room.compiler)   ← kapt, NOT implementation`)
  }

  if (hasRoomFull) {
    parts.push(`ROOM DATABASE (FULL — includes all of basic + extensions):
All basic Room files above, PLUS:
- Add updatedAt: Long = System.currentTimeMillis() column to Note entity
- Add TypeConverter class StringListConverter:
    @TypeConverter fun fromList(list: List<String>): String = list.joinToString(",")
    @TypeConverter fun toList(s: String): List<String> = if (s.isEmpty()) emptyList() else s.split(",")
  Add val tags: List<String> = emptyList() to Note entity
- Add @TypeConverters(StringListConverter::class) to @Database annotation
- Migration MIGRATION_1_2:
    val MIGRATION_1_2 = object : Migration(1, 2) {
      override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE notes ADD COLUMN updatedAt INTEGER NOT NULL DEFAULT 0")
        db.execSQL("ALTER TABLE notes ADD COLUMN tags TEXT NOT NULL DEFAULT ''")
      }
    }
  AppDatabase version = 2, builder: .addMigrations(MIGRATION_1_2).build()
- Extra NoteDao queries:
    @Query("SELECT COUNT(*) FROM notes") fun countNotes(): Flow<Int>
    @Query("SELECT * FROM notes WHERE title LIKE '%' || :query || '%' OR body LIKE '%' || :query || '%'") fun searchNotes(query: String): Flow<List<Note>>

Gradle: same as basic Room (room = "2.6.1")`)
  }

  if (features.includes('notifications')) {
    parts.push(`NOTIFICATIONS:
New file — ${srcRoot}/util/NotificationHelper.kt:
  object NotificationHelper {
    const val CHANNEL_ID   = "${pkg.replace(/\./g, '_')}_channel"
    const val CHANNEL_NAME = "${projectName} Notifications"

    fun createNotificationChannel(context: Context) {
      val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, NotificationManager.IMPORTANCE_DEFAULT).apply {
        description = "${projectName} app notifications"
        enableVibration(true)
      }
      (context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
    }

    fun show(context: Context, title: String, body: String, notifId: Int = 1) {
      if (ActivityCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return
      val notif = NotificationCompat.Builder(context, CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setContentTitle(title)
        .setContentText(body)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT)
        .setAutoCancel(true)
        .build()
      NotificationManagerCompat.from(context).notify(notifId, notif)
    }
  }

Call in Application.onCreate() (or MainActivity.onCreate() if no Application class):
  NotificationHelper.createNotificationChannel(this)

AndroidManifest: <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />`)
  }

  if (features.includes('firebase')) {
    parts.push(`FIREBASE (Analytics + google-services):
New file — ${srcRoot}/util/FirebaseHelper.kt:
  object FirebaseHelper {
    fun logEvent(analytics: FirebaseAnalytics, eventName: String, block: Bundle.() -> Unit = {}) {
      analytics.logEvent(eventName, Bundle().apply(block))
    }
    fun logScreenView(analytics: FirebaseAnalytics, screenName: String) {
      logEvent(analytics, FirebaseAnalytics.Event.SCREEN_VIEW) {
        putString(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
      }
    }
  }

AndroidManifest comment (inside <application>):
  <!-- IMPORTANT: Download google-services.json from https://console.firebase.google.com
       and place it at app/google-services.json before building. -->

Gradle setup:
  settings.gradle.kts pluginManagement — add: id("com.google.gms.google-services") version "4.4.1" apply false
  build.gradle.kts root — add: alias(libs.plugins.google.services) apply false
  app/build.gradle.kts plugins — add: alias(libs.plugins.google.services)
  app/build.gradle.kts deps — add:
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.analytics)

libs.versions.toml:
  [versions]: firebaseBom = "32.7.4"; googleServices = "4.4.1"
  [libraries]:
    firebase-bom      = { group = "com.google.firebase", name = "firebase-bom",      version.ref = "firebaseBom" }
    firebase-analytics = { group = "com.google.firebase", name = "firebase-analytics" }  ← no version, from BOM
  [plugins]:
    google-services = { id = "com.google.gms.google-services", version.ref = "googleServices" }`)
  }

  if (features.includes('hilt')) {
    parts.push(`HILT DEPENDENCY INJECTION:
New file — ${srcRoot}/${projectName}Application.kt:
  @HiltAndroidApp
  class ${projectName}Application : Application() {
    override fun onCreate() {
      super.onCreate()
      // Global init here
    }
  }

AndroidManifest: android:name=".${projectName}Application" on <application> tag (REQUIRED — Hilt will crash without this)
MainActivity: add @AndroidEntryPoint annotation above the class
All ViewModels: add @HiltViewModel + @Inject constructor(...)
All injected dependencies: add @Inject constructor(...)

Gradle (use kapt — NOT KSP — for Hilt 2.51.1 + Kotlin 1.9.24 compatibility):
  [versions]: hilt = "2.51.1"
  [libraries]:
    hilt-android  = { group = "com.google.dagger", name = "hilt-android",          version.ref = "hilt" }
    hilt-compiler = { group = "com.google.dagger", name = "hilt-android-compiler",  version.ref = "hilt" }
  [plugins]:
    hilt = { id = "com.google.dagger.hilt.android", version.ref = "hilt" }
    kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }

app/build.gradle.kts:
  plugins { alias(libs.plugins.hilt); alias(libs.plugins.kapt) }
  dependencies { implementation(libs.hilt.android); kapt(libs.hilt.compiler) }`)
  }

  if (hasCiCd) {
    parts.push(`GITHUB ACTIONS CI/CD:
New file — .github/workflows/android.yml (note: path starts with .github, include the dot):
  name: Android CI
  on:
    push:
      branches: [ main ]
    pull_request:
      branches: [ main ]
  jobs:
    build:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Set up JDK 17
          uses: actions/setup-java@v4
          with:
            java-version: '17'
            distribution: 'temurin'
            cache: gradle
        - name: Cache Gradle
          uses: actions/cache@v4
          with:
            path: |
              ~/.gradle/caches
              ~/.gradle/wrapper
            key: gradle-\${{ hashFiles('**/*.gradle.kts', '**/libs.versions.toml', '**/gradle-wrapper.properties') }}
            restore-keys: gradle-
        - name: Grant gradlew permission
          run: chmod +x gradlew
        - name: Build Debug APK
          run: ./gradlew assembleDebug --no-daemon --stacktrace
        - name: Upload APK
          uses: actions/upload-artifact@v4
          with:
            name: debug-apk
            path: app/build/outputs/apk/debug/*.apk
            retention-days: 7`)
  }

  if (features.includes('multi_module')) {
    parts.push(`MULTI-MODULE STRUCTURE:
Add :core module alongside :app:

New files:
- core/build.gradle.kts:
  plugins { alias(libs.plugins.android.library); alias(libs.plugins.kotlin.android) }
  android { namespace = "${pkg}.core"; compileSdk = 34; defaultConfig { minSdk = 24 }; compileOptions { sourceCompatibility = JavaVersion.VERSION_1_8; targetCompatibility = JavaVersion.VERSION_1_8 }; kotlinOptions { jvmTarget = "1.8" } }
  dependencies { implementation(libs.core.ktx) }
- core/src/main/AndroidManifest.xml: <manifest />
- core/src/main/kotlin/${pkg.replace(/\./g, '/')}/core/util/Extensions.kt: package ${pkg}.core.util — common extension functions (e.g. fun String.capitalizeFirst(): String)
- core/src/main/kotlin/${pkg.replace(/\./g, '/')}/core/model/Resource.kt: package ${pkg}.core.model — sealed class Resource<out T>(val data: T? = null, val message: String? = null) { class Success<T>(data: T) : Resource<T>(data); class Error<T>(message: String, data: T? = null) : Resource<T>(data, message); class Loading<T>(data: T? = null) : Resource<T>(data) }

settings.gradle.kts: include(":app", ":core")
app/build.gradle.kts deps: implementation(project(":core"))
libs.plugins: add android-library = { id = "com.android.library", version.ref = "agp" }`)
  }

  return parts.join('\n\n───────────────────────────────────────\n\n')
}

function buildRequiredFileList(
  isClean: boolean,
  isCompose: boolean,
  srcRoot: string,
  hasHilt: boolean,
): string {
  const files: string[] = []

  if (isClean) {
    files.push(
      `- ${srcRoot}/presentation/viewmodel/MainViewModel.kt`,
      `- ${srcRoot}/presentation/${isCompose ? 'screen/MainScreen.kt' : 'state/MainUiState.kt'}`,
      `- ${srcRoot}/domain/model/SampleData.kt`,
      `- ${srcRoot}/domain/repository/SampleRepository.kt`,
      `- ${srcRoot}/domain/usecase/GetSampleDataUseCase.kt`,
      `- ${srcRoot}/data/repository/SampleRepositoryImpl.kt`,
      `- ${srcRoot}/data/source/SampleDataSource.kt`,
    )
  } else {
    files.push(
      `- ${srcRoot}/viewmodel/MainViewModel.kt`,
      `- ${srcRoot}/data/repository/MainRepository.kt`,
    )
    if (isCompose) files.push(`- ${srcRoot}/ui/MainScreen.kt`)
  }

  if (hasHilt) {
    files.push(`- ${srcRoot}/di/AppModule.kt`)
  }

  return files.join('\n')
}
