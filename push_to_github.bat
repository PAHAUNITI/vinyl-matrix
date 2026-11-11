@echo off
chcp 65001 >nul
echo ========================================================
echo   VINYL MATRIX - ПУБЛИКАЦИЯ НА GITHUB
echo ========================================================
echo.

set /p REPO_NAME="Введите имя репозитория на GitHub (по умолчанию vinyl-matrix): "
if "%REPO_NAME%"=="" set REPO_NAME=vinyl-matrix

echo.
echo Подключаем удаленный репозиторий: https://github.com/pahauniti/%REPO_NAME%.git ...
git remote remove origin 2>nul
git remote add origin https://github.com/pahauniti/%REPO_NAME%.git

echo Отправляем ветку main на GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [УСПЕХ] Проект успешно опубликован на GitHub!
    echo Репозиторий: https://github.com/pahauniti/%REPO_NAME%
    echo.
    echo Чтобы включить живой сайт на GitHub Pages:
    echo 1. Перейдите в Settings - Pages
    echo 2. Выберите ветку main и сохраните.
) else (
    echo.
    echo [ВНИМАНИЕ] Произошла ошибка отправки.
    echo Убедитесь, что репозиторий создан на https://github.com/new
)

echo.
pause
