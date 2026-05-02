1. Wstęp i Cel Projektu
Celem projektu jest stworzenie nowoczesnego, w pełni responsywnego systemu rezerwacji online dla kręgielni Niko & Roman Bowling, inspirowanej motywami z Liberty City. Aplikacja umożliwia klientom intuicyjny wybór terminu, toru (standardowego lub z bandami dla dzieci), rezerwację butów bowlingowych, aplikację kodów rabatowych oraz bezpieczną płatność internetową. Dla pracowników oraz właściciela przygotowano wydzielony panel administracyjny do zarządzania rezerwacjami, personelem oraz stanem magazynowym.

2. Architektura i Stos Technologiczny
Projekt został zaprojektowany w architekturze klient-serwer (Client-Server) z wykorzystaniem podejścia Serverless. Aplikacja charakteryzuje się ścisłą separacją warstwy prezentacji od logiki biznesowej i bazy danych.

Technologie i narzędzia:
Frontend i Backend (Fullstack): Next.js (React, TypeScript, App Router). Renderowanie po stronie serwera (SSR) oraz generowanie statyczne (SSG) w połączeniu z architekturą komponentów klienckich ('use client').

Baza danych i Autoryzacja: Supabase (PostgreSQL). Wykorzystanie relacyjnej bazy danych, mechanizmów autentykacji (Supabase Auth) oraz polityk bezpieczeństwa na poziomie wierszy (RLS).

Zarządzanie stylami: Tailwind CSS. Podejście utility-first, pełna responsywność (Mobile First) oraz wsparcie dla efektów wizualnych (np. tła wideo, filtry backdrop-blur).

Obsługa Płatności: Stripe API. Integracja z zewnętrznym operatorem płatności za pomocą bezpiecznych sesji Checkout oraz powiadomień Webhook.

Komunikacja e-mail: Resend. Serwerowy system wysyłki wiadomości transakcyjnych (potwierdzenia rezerwacji).

Hosting i CI/CD: Vercel.

3. Struktura Bazy Danych i Bezpieczeństwo RLS
Baza danych została znormalizowana i oparta o system PostgreSQL dostarczany przez platformę Supabase.

3.1. Wykaz tabel systemu:
profiles: Przechowuje konta użytkowników i ich role (boss, employee). Powiązana relacją 1:1 z systemową tabelą auth.users poprzez id.

lanes: Informacje o torach bowlingowych (numer toru, typ: standardowy/dla dzieci, cena za godzinę, maksymalna liczba osób).

bookings: Główna tabela przechowująca dane rezerwacji (ID toru, czas rozpoczęcia i zakończenia, dane klienta, status płatności, kwota łączna).

shoe_inventory: Magazyn obuwia (rozmiary, liczba dostępnych par, cena za wypożyczenie).

shoe_rentals: Relacja łącząca rezerwację z wypożyczonymi butami.

promo_codes: Kody rabatowe (wartość zniżki, typ: procentowy/kwotowy, status aktywności).

blocked_customers: Lista zablokowanych adresów e-mail (ochrona przed spamem i nieuczciwymi klientami).

3.2. Bezpieczeństwo danych (Row Level Security & Views)
Kluczowym elementem inżynierii bezpieczeństwa w projekcie jest zastosowanie Row Level Security (RLS). Zapobiega to nieautoryzowanemu dostępowi do danych klientów za pomocą publicznego klucza API (anon key).

Zastosowane polityki RLS w PostgreSQL:
Tabela bookings:

SELECT: Dostęp zablokowany dla użytkowników anonimowych (anon). Tylko zalogowani użytkownicy z rolami boss i employee mogą przeglądać pełną listę rezerwacji wraz z danymi osobowymi.

INSERT: Publiczny dostęp dla każdego użytkownika – umożliwia klientowi dodanie rezerwacji przez formularz.

Tabela profiles:

SELECT: Każdy zalogowany użytkownik widzi tylko swój profil (auth.uid() = id). Modyfikacja ról możliwa jest wyłącznie przez użytkownika z rolą boss.

Bezpieczeństwo kalendarza rezerwacji (Widoki bazodanowe):
Aby umożliwić działanie kalendarza rezerwacji na stronie głównej (klient musi wiedzieć, które godziny są zajęte) przy jednoczesnym ukryciu danych osobowych, wdrożono Widok SQL (View):

SQL
CREATE OR REPLACE VIEW occupied_lanes AS
SELECT lane_id, start_time, end_time, status
FROM bookings
WHERE status IN ('confirmed', 'paid');

GRANT SELECT ON occupied_lanes TO anon, authenticated;
Dzięki temu frontend pobiera z bazy wyłącznie anonimowe przedziały czasowe, a dane klientów pozostają chronione polityką RLS tabeli bookings.

4. Przepływ Procesu Rezerwacji (Booking Wizard Flow)
Aplikacja implementuje wieloetapowy kreator rezerwacji (wizard), który minimalizuje ryzyko błędów użytkownika:

Krok 1: Wybór terminu – Użytkownik wybiera datę oraz godzinę rozpoczęcia i czas trwania (maksymalnie do 23:00, zgodnie z godzinami otwarcia obiektu).

Krok 2: Wybór toru – Aplikacja odpytuje widok occupied_lanes o zajęte tory w wybranym przedziale czasowym. Tory niedostępne są blokowane.

Krok 3: Gracze i Buty – Określenie liczby osób. Użytkownik musi wybrać dokładnie tyle par butów, ile wynosi liczba graczy. System weryfikuje dostępność rozmiarów w shoe_inventory.

Krok 4: Dane i płatność – Formularz walidowany wyrażeniami regularnymi (Regex). Klient podaje imię, nazwisko, e-mail oraz telefon. Na tym etapie istnieje możliwość podania kodu rabatowego, który przelicza cenę końcową po stronie serwera.

5. Integracja z API Zewnętrznymi i Webhooki
5.1. Płatności Stripe
Proces transakcyjny nie opiera się na danych przesyłanych przez przeglądarkę klienta. Dane rezerwacji przekazywane są do wewnętrznego API /api/checkout. Serwer weryfikuje cenę toru z bazy danych, dolicza koszt butów, aplikuje ewentualny rabat i tworzy bezpieczną sesję Stripe Checkout.

5.2. Webhooki
Po pomyślnym opłaceniu rezerwacji, Stripe wysyła asynchroniczne powiadomienie na endpoint /api/webhooks/stripe. Dopiero po zweryfikowaniu podpisu nagłówka stripe-signature za pomocą klucza STRIPE_WEBHOOK_SECRET, status rezerwacji w bazie danych zostaje zmieniony na paid. Gwarantuje to odporność systemu na próby manipulacji statusem rezerwacji przez modyfikację adresu URL.

6. Optymalizacja Interfejsu Użytkownika (UI/UX)
Video Background (Efekt głębi): W głównym pliku layoutu (layout.tsx) osadzono wyciszony plik wideo, który jest renderowany z pozycją fixed inset-0. Zastosowano optymalizację w postaci wycięcia ścieżki dźwiękowej oraz ograniczenia wagi pliku (do 3 MB).

Wizualna hierarchia (Tailwind CSS): Wykorzystano klasy backdrop-blur-md, bg-gray-900/20 oraz opacity-30 blur-sm dla zachowania wysokiego kontrastu tekstu na tle ruchomego wideo.

Separacja paneli: Poprzez weryfikację ścieżki pathname.startsWith('/admin'), layout dynamicznie decyduje o wyłączeniu tła wideo w panelu administracyjnym, co zapobiega rozpraszaniu uwagi pracowników podczas pracy.

7. Instrukcja Instalacji i Wdrożenia
Wymagania wstępne:
Node.js v18+ lub nowszy

Konto Supabase (baza PostgreSQL)

Konto Stripe (Developer Dashboard)

Konto Resend

Instalacja projektu:
Bash
# 1. Sklonowanie repozytorium
git clone https://github.com/twoje-repozytorium/kregielnia.git
cd kregielnia

# 2. Instalacja zależności
npm install

# 3. Konfiguracja zmiennych środowiskowych (.env.local)
# Należy utworzyć plik .env.local w głównym katalogu i uzupełnić klucze:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
# STRIPE_SECRET_KEY=...
# STRIPE_WEBHOOK_SECRET=...
# RESEND_API_KEY=...

# 4. Uruchomienie serwera deweloperskiego
npm run dev
