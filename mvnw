#!/bin/sh
# Maven Wrapper 3.2.0
if [ -z "$JAVA_HOME" ]; then
  JAVA_EXE="$(command -v java)"
else
  JAVA_EXE="$JAVA_HOME/bin/java"
fi
if [ ! -x "$JAVA_EXE" ]; then
  echo "Error: JAVA_HOME is not set and no 'java' command could be found in your PATH." >&2
  exit 1
fi
WRAPPER_DIR="$(cd "$(dirname "$0")" || exit 1; pwd -P)/.mvn/wrapper"
WRAPPER_JAR="$WRAPPER_DIR/maven-wrapper.jar"
WRAPPER_PROP="$WRAPPER_DIR/maven-wrapper.properties"
if [ ! -f "$WRAPPER_JAR" ]; then
  echo "Downloading Maven Wrapper jar" >&2
  mkdir -p "$WRAPPER_DIR"
  WRAPPER_URL=$(grep -E "^wrapperUrl=" "$WRAPPER_PROP" | cut -d= -f2-)
  if [ -z "$WRAPPER_URL" ]; then
    echo "wrapperUrl not set in $WRAPPER_PROP" >&2
    exit 1
  fi
  if command -v curl >/dev/null 2>&1; then
    curl -fsSL -o "$WRAPPER_JAR" "$WRAPPER_URL" || exit 1
  elif command -v wget >/dev/null 2>&1; then
    wget -q -O "$WRAPPER_JAR" "$WRAPPER_URL" || exit 1
  else
    echo "Neither curl nor wget is available to download Maven Wrapper jar" >&2
    exit 1
  fi
fi
if [ -z "$MAVEN_PROJECTBASEDIR" ]; then
  MAVEN_PROJECTBASEDIR="$(cd "$(dirname "$0")" || exit 1; pwd -P)"
fi
exec "$JAVA_EXE" -classpath "$WRAPPER_JAR" -Dmaven.multiModuleProjectDirectory="$MAVEN_PROJECTBASEDIR" org.apache.maven.wrapper.MavenWrapperMain "$@"
