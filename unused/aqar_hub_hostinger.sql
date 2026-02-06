-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 30, 2026 at 12:52 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12
--
-- MODIFIED FOR HOSTINGER COMPATIBILITY
-- Removed DEFINER clauses and events that require special privileges

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u336570575_aqar`
--

-- --------------------------------------------------------
-- NOTE: Stored procedures and events removed for Hostinger compatibility
-- These require special privileges not available in shared hosting
-- The application will work without them
-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` varchar(50) DEFAULT NULL COMMENT 'User email or ID',
  `action` varchar(100) NOT NULL COMMENT 'Action performed',
  `entity_type` varchar(50) DEFAULT NULL COMMENT 'Type of entity (document, user, etc.)',
  `entity_id` int(11) DEFAULT NULL COMMENT 'ID of affected entity',
  `details` text DEFAULT NULL COMMENT 'JSON or text details',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System activity and audit logs';

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(11) NOT NULL,
  `faculty_id` varchar(50) NOT NULL COMMENT 'Faculty email or ID',
  `faculty_name` varchar(255) NOT NULL,
  `criteria_id` varchar(10) NOT NULL COMMENT 'Criteria number',
  `sub_criteria_id` varchar(20) NOT NULL COMMENT 'Sub-criteria ID',
  `assigned_by` varchar(255) NOT NULL COMMENT 'Admin who assigned',
  `assigned_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Faculty criteria assignments';

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `faculty_id`, `faculty_name`, `criteria_id`, `sub_criteria_id`, `assigned_by`, `assigned_date`, `created_at`, `updated_at`) VALUES
(1, 'aswin@cutmap.ac.in', 'Aswini Kumar', 'c1', '1.1.1', 'admin@iqac.edu', '2026-01-28 05:25:55', '2026-01-28 05:25:55', '2026-01-28 05:25:55');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `date` timestamp NOT NULL DEFAULT current_timestamp(),
  `criteria` varchar(10) NOT NULL COMMENT 'Criteria number (1-7)',
  `sub_criteria` varchar(20) NOT NULL COMMENT 'Sub-criteria (e.g., 1.1.1)',
  `faculty_name` varchar(255) NOT NULL,
  `faculty_id` varchar(50) NOT NULL COMMENT 'Faculty email or ID',
  `academic_year` varchar(20) NOT NULL COMMENT 'e.g., 2024-25',
  `document_url` text NOT NULL COMMENT 'Public URL to access file',
  `file_path` text DEFAULT NULL COMMENT 'Local file system path',
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL COMMENT 'File size in bytes',
  `mime_type` varchar(100) DEFAULT NULL COMMENT 'File MIME type',
  `upload_status` enum('Uploaded','Failed') DEFAULT 'Uploaded',
  `iqac_status` enum('Pending','Approved','Rejected') DEFAULT 'Pending',
  `remarks` text DEFAULT NULL COMMENT 'Comments or notes',
  `approved_by` varchar(255) DEFAULT NULL COMMENT 'Name of approver',
  `approved_date` timestamp NULL DEFAULT NULL COMMENT 'Date of approval/rejection',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Document tracking and metadata';

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `date`, `criteria`, `sub_criteria`, `faculty_name`, `faculty_id`, `academic_year`, `document_url`, `file_path`, `file_name`, `file_size`, `mime_type`, `upload_status`, `iqac_status`, `remarks`, `approved_by`, `approved_date`, `created_at`, `updated_at`) VALUES
(1, '2026-01-28 10:26:18', '1', '1.1.1', 'Aswini Kumar', 'aswin@cutmap.ac.in', '2025-26', 'http://localhost/aqar-hub-backend/IQAC/2025-26/1/1.1.1/1769595978_6979e44ad46bc.png', 'C:\\\\xampp\\\\htdocs\\\\aqar-hub-backend\\\\api\\\\documents/../../IQAC/2025-26/1/1.1.1/1769595978_6979e44ad46bc.png', 'CT Simulator -CUTMAP.png', 1423819, 'image/png', 'Uploaded', 'Approved', '', 'IQAC Coordinator', '2026-01-28 10:41:16', '2026-01-28 10:26:18', '2026-01-29 06:19:57'),
(2, '2026-01-28 10:44:57', '1', '1.1.1', 'Aswini Kumar', 'aswin@cutmap.ac.in', '2024-25', 'http://localhost/aqar-hub-backend/IQAC/2024-25/1/1.1.1/babushankar_1769597097.png', 'C:\\\\xampp\\\\htdocs\\\\aqar-hub-backend\\\\api\\\\documents/../../IQAC/2024-25/1/1.1.1/babushankar_1769597097.png', 'babushankar.png', 1183587, 'image/png', 'Uploaded', 'Approved', '', 'IQAC Coordinator', '2026-01-29 04:11:13', '2026-01-28 10:42:15', '2026-01-29 06:19:57'),
(3, '2026-01-29 06:33:01', '1', '1.1.1', 'Aswini Kumar', 'aswin@cutmap.ac.in', '2025-26', 'http://localhost/aqar-hub-backend/IQAC/2025-26/1/1.1.1/ieee_mb_tag_blue_pne_1769668381.png', 'C:\\\\xampp\\\\htdocs\\\\aqar-hub-backend\\\\api\\\\documents/../../IQAC/2025-26/1/1.1.1/ieee_mb_tag_blue_pne_1769668381.png', 'ieee mb tag blue pne.png', 10107, 'image/png', 'Uploaded', 'Rejected', 'not a proper doc', 'IQAC Coordinator', '2026-01-29 06:39:17', '2026-01-29 06:26:53', '2026-01-29 06:39:17');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IPv4 or IPv6 address',
  `user_agent` text DEFAULT NULL COMMENT 'Browser user agent',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User session management';

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `session_token`, `expires_at`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, 'e47e8e3cd6fa80ebb29692003e1322402d8c1671a1ffff822c5a2c1ab675a3d4', '2026-01-29 00:00:44', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 04:30:44'),
(2, 1, 'b8bdb3c86d49e5026d87bb12ec24d049381242c3828d4e3f4437eb3cb532af79', '2026-01-29 00:07:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-28 04:37:43'),
(3, 1, 'c143cdf1c2cd0d910fdd2c1757da629fb2127a3d7087f9b260550bf7d99fdd34', '2026-01-29 00:35:48', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-28 05:05:48'),
(4, 1, '7440af54b3700f0a4fec94a2048aaaa5f4f16cc87ff5340892af9c0ad481931d', '2026-01-29 00:38:05', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 05:08:05'),
(5, 1, 'e8bbf4b89d8d9eb1369d0a1cda8466f34bc5404e72c2fa04d9270a75f2b78e8b', '2026-01-29 00:38:39', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 05:08:39'),
(6, 1, 'a0e304fe9f58a21938d9f85a398c43f95354a3264717f2e2e53947a1dafc4849', '2026-01-29 00:43:02', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 05:13:02'),
(10, 6, '0fcf922608cdd8670d819aa779426da49c7b743a1b9d4a195581891fbbe304d3', '2026-01-29 01:24:11', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 05:54:11'),
(12, 6, 'a5595ff11450187db83d579d69687aa8534af2c46342279a06894c9f09bd4b68', '2026-01-29 01:25:58', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-28 05:55:58'),
(13, 6, '4c73a57ea48faeda224bfc89e52b5b72e21585f2ff1d672ad6c65dcb1a2a6269', '2026-01-29 02:03:11', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 06:33:11'),
(14, 6, '58977266e93302c057b3bfb33eacf29f253a52e1c38c26b70583cadc8a3f8370', '2026-01-29 02:03:33', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 06:33:33'),
(15, 6, '520cf5f4dad6079182969190e7498cffb8cddd8695ddff52f4ae72c278d71e0e', '2026-01-29 02:04:07', '::1', 'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.26100.7462', '2026-01-28 06:34:07'),
(17, 6, 'ac2580841de79dc6edd0ce728fc3e2ca4c6daf651697559e3edb621da3fd8798', '2026-01-29 06:08:50', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-28 10:38:50'),
(18, 4, 'cdb72222d42b8ca60198dbb8e4115ef95849f3f29e2f3674b8ef3243b32aacbe', '2026-01-29 06:10:44', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-28 10:40:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'Bcrypt hashed password',
  `role` enum('Admin','Management','IQAC','Faculty') NOT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User credentials and roles';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@iqac.in', '$2y$10$TekzZvFvomHoSgsZzc3l.OtjN7mVPuYruAZzgqOBP9sgYypxjarJO', 'Admin', 'Active', '2026-01-27 09:43:23', '2026-01-29 05:01:48'),
(4, 'IQAC Coordinator', 'iqac@cutmap.ac.in', '$2y$10$TekzZvFvomHoSgsZzc3l.OtjN7mVPuYruAZzgqOBP9sgYypxjarJO', 'IQAC', 'Active', '2026-01-27 09:43:24', '2026-01-28 05:37:12'),
(5, 'Management User', 'vc@cutmap.ac.in', '$2y$10$TekzZvFvomHoSgsZzc3l.OtjN7mVPuYruAZzgqOBP9sgYypxjarJO', 'Management', 'Active', '2026-01-27 09:43:24', '2026-01-29 04:53:09'),
(6, 'Aswini Kumar', 'aswin@cutmap.ac.in', '$2y$10$TekzZvFvomHoSgsZzc3l.OtjN7mVPuYruAZzgqOBP9sgYypxjarJO', 'Faculty', 'Active', '2026-01-28 05:23:02', '2026-01-28 05:54:03');

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_documents_by_criteria`
-- (See below for the actual view)
--
CREATE TABLE `v_documents_by_criteria` (
`criteria` varchar(10)
,`total_documents` bigint(21)
,`approved` decimal(22,0)
,`pending` decimal(22,0)
,`rejected` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_documents_by_year`
-- (See below for the actual view)
--
CREATE TABLE `v_documents_by_year` (
`academic_year` varchar(20)
,`total_documents` bigint(21)
,`approved` decimal(22,0)
,`pending` decimal(22,0)
,`rejected` decimal(22,0)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_faculty_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_faculty_summary` (
`faculty_id` varchar(50)
,`faculty_name` varchar(255)
,`total_uploads` bigint(21)
,`approved` decimal(22,0)
,`pending` decimal(22,0)
,`rejected` decimal(22,0)
,`last_upload_date` timestamp
);

-- --------------------------------------------------------

--
-- Structure for view `v_documents_by_criteria`
-- DEFINER removed for Hostinger compatibility
--
DROP TABLE IF EXISTS `v_documents_by_criteria`;

CREATE VIEW `v_documents_by_criteria` AS 
SELECT 
  `documents`.`criteria` AS `criteria`, 
  count(0) AS `total_documents`, 
  sum(case when `documents`.`iqac_status` = 'Approved' then 1 else 0 end) AS `approved`, 
  sum(case when `documents`.`iqac_status` = 'Pending' then 1 else 0 end) AS `pending`, 
  sum(case when `documents`.`iqac_status` = 'Rejected' then 1 else 0 end) AS `rejected` 
FROM `documents` 
GROUP BY `documents`.`criteria` 
ORDER BY `documents`.`criteria` ASC;

-- --------------------------------------------------------

--
-- Structure for view `v_documents_by_year`
-- DEFINER removed for Hostinger compatibility
--
DROP TABLE IF EXISTS `v_documents_by_year`;

CREATE VIEW `v_documents_by_year` AS 
SELECT 
  `documents`.`academic_year` AS `academic_year`, 
  count(0) AS `total_documents`, 
  sum(case when `documents`.`iqac_status` = 'Approved' then 1 else 0 end) AS `approved`, 
  sum(case when `documents`.`iqac_status` = 'Pending' then 1 else 0 end) AS `pending`, 
  sum(case when `documents`.`iqac_status` = 'Rejected' then 1 else 0 end) AS `rejected` 
FROM `documents` 
GROUP BY `documents`.`academic_year` 
ORDER BY `documents`.`academic_year` DESC;

-- --------------------------------------------------------

--
-- Structure for view `v_faculty_summary`
-- DEFINER removed for Hostinger compatibility
--
DROP TABLE IF EXISTS `v_faculty_summary`;

CREATE VIEW `v_faculty_summary` AS 
SELECT 
  `documents`.`faculty_id` AS `faculty_id`, 
  `documents`.`faculty_name` AS `faculty_name`, 
  count(0) AS `total_uploads`, 
  sum(case when `documents`.`iqac_status` = 'Approved' then 1 else 0 end) AS `approved`, 
  sum(case when `documents`.`iqac_status` = 'Pending' then 1 else 0 end) AS `pending`, 
  sum(case when `documents`.`iqac_status` = 'Rejected' then 1 else 0 end) AS `rejected`, 
  max(`documents`.`date`) AS `last_upload_date` 
FROM `documents` 
GROUP BY `documents`.`faculty_id`, `documents`.`faculty_name` 
ORDER BY count(0) DESC;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_assignment` (`faculty_id`,`sub_criteria_id`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_criteria` (`criteria_id`),
  ADD KEY `idx_sub_criteria` (`sub_criteria_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_faculty_id` (`faculty_id`),
  ADD KEY `idx_criteria` (`criteria`),
  ADD KEY `idx_sub_criteria` (`sub_criteria`),
  ADD KEY `idx_academic_year` (`academic_year`),
  ADD KEY `idx_iqac_status` (`iqac_status`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_composite` (`faculty_id`,`academic_year`,`iqac_status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_session_token` (`session_token`),
  ADD KEY `idx_expires_at` (`expires_at`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
