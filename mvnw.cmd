@ECHO OFF
REM Maven Wrapper 3.2.0
SETLOCAL
SET WRAPPER_DIR=%~dp0.mvn\wrapper
SET WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar
SET WRAPPER_PROP=%WRAPPER_DIR%\maven-wrapper.properties

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Downloading Maven Wrapper jar
  FOR /F "tokens=1,* delims==" %%A IN ('findstr /R /C:"^wrapperUrl=" "%WRAPPER_PROP%"') DO SET WRAPPER_URL=%%B
  IF "%WRAPPER_URL%"=="" (
    ECHO wrapperUrl not set in %WRAPPER_PROP%
    EXIT /B 1
  )
  IF EXIST "%ProgramFiles%\Git\mingw64\bin\curl.exe" (
    "%ProgramFiles%\Git\mingw64\bin\curl.exe" -fsSL -o "%WRAPPER_JAR%" "%WRAPPER_URL%" || EXIT /B 1
  ) ELSE IF EXIST "%ProgramFiles%\Git\usr\bin\curl.exe" (
    "%ProgramFiles%\Git\usr\bin\curl.exe" -fsSL -o "%WRAPPER_JAR%" "%WRAPPER_URL%" || EXIT /B 1
  ) ELSE (
    powershell -Command "Invoke-WebRequest -UseBasicParsing -Uri '%WRAPPER_URL%' -OutFile '%WRAPPER_JAR%'" || EXIT /B 1
  )
)

IF DEFINED JAVA_HOME (
  SET JAVA_EXE=%JAVA_HOME%\bin\java.exe
) ELSE (
  SET JAVA_EXE=java.exe
)

IF NOT EXIST "%JAVA_EXE%" (
  ECHO JAVA_HOME is not set and no 'java' command could be found in your PATH.
  EXIT /B 1
)

IF NOT DEFINED MAVEN_PROJECTBASEDIR SET MAVEN_PROJECTBASEDIR=%CD%

"%JAVA_EXE%" -classpath "%WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" org.apache.maven.wrapper.MavenWrapperMain %*
ENDLOCAL
