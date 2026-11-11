@echo off
chcp 65001 >nul
echo ========================================================
echo   VINYL MATRIX - ПУБЛИКАЦИЯ НА GITHUB
echo ========================================================
echo.
echo Репозиторий уже привязан к: https://github.com/pahauniti/vinyl-matrix.git
echo Отправляем ветку main на GitHub...
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo [УСПЕХ] Проект успешно опубликован на GitHub!
    echo Репозиторий: https://github.com/pahauniti/vinyl-matrix
    echo ========================================================
    echo.
    echo Чтобы включить живой сайт на GitHub Pages:
    echo 1. Откройте https://github.com/pahauniti/vinyl-matrix/settings/pages
    echo 2. В поле Branch выберите 'main' и сохраните.
) else (
    echo.
    echo [ВНИМАНИЕ] Если открылось окно браузера для авторизации - подтвердите вход.
)

echo.
pause
