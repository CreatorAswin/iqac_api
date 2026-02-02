<?php
/**
 * Authentication Class
 * Handles user authentication and session management
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/config.php';

class Auth
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    /**
     * Authenticate user with email and password
     * @param string $email User email
     * @param string $password User password
     * @return array Response with user data and token
     */
    public function login($email, $password)
    {
        try {
            $query = "SELECT id, name, email, password, role, status FROM users WHERE email = :email LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch();

                // Check if account is active
                if ($user['status'] !== 'Active') {
                    return ['success' => false, 'error' => 'Account is inactive. Contact administrator.'];
                }

                // Verify password
                if (password_verify($password, $user['password'])) {
                    // Create session token
                    $sessionToken = bin2hex(random_bytes(32));
                    $expiresAt = date('Y-m-d H:i:s', time() + SESSION_LIFETIME);

                    // Store session in database
                    $query = "INSERT INTO sessions (user_id, session_token, expires_at, ip_address, user_agent) 
                             VALUES (:user_id, :token, :expires, :ip, :user_agent)";
                    $stmt = $this->db->prepare($query);
                    $stmt->bindParam(':user_id', $user['id']);
                    $stmt->bindParam(':token', $sessionToken);
                    $stmt->bindParam(':expires', $expiresAt);
                    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? '';
                    $stmt->bindParam(':ip', $ipAddress);
                    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
                    $stmt->bindParam(':user_agent', $userAgent);
                    $stmt->execute();

                    // Remove password from response
                    unset($user['password']);

                    return [
                        'success' => true,
                        'data' => [
                            'user' => $user,
                            'token' => $sessionToken
                        ]
                    ];
                } else {
                    return ['success' => false, 'error' => 'Invalid password'];
                }
            }

            return ['success' => false, 'error' => 'User not found'];
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return ['success' => false, 'error' => 'Login failed'];
        }
    }

    /**
     * Verify session token
     * @param string $token Session token
     * @return array|null User data if valid, null otherwise
     */
    public function verifyToken($token)
    {
        try {
            $query = "SELECT u.* FROM users u 
                     INNER JOIN sessions s ON u.id = s.user_id 
                     WHERE s.session_token = :token AND s.expires_at > NOW() 
                     LIMIT 1";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch();
                unset($user['password']);
                return $user;
            }

            return null;
        } catch (Exception $e) {
            error_log("Token verification error: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Logout user by invalidating token
     * @param string $token Session token
     * @return array Response
     */
    public function logout($token)
    {
        try {
            $query = "DELETE FROM sessions WHERE session_token = :token";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();
            return ['success' => true, 'message' => 'Logged out successfully'];
        } catch (Exception $e) {
            error_log("Logout error: " . $e->getMessage());
            return ['success' => false, 'error' => 'Logout failed'];
        }
    }

    /**
     * Clean expired sessions
     * @return int Number of sessions deleted
     */
    public function cleanExpiredSessions()
    {
        try {
            $query = "DELETE FROM sessions WHERE expires_at < NOW()";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            return $stmt->rowCount();
        } catch (Exception $e) {
            error_log("Clean sessions error: " . $e->getMessage());
            return 0;
        }
    }
}
