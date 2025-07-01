import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { signIn } from "next-auth/react";
import LoginPage from "@/app/page";

// Mock the modules
jest.mock("next-auth/react");

const mockUseRouter = jest.fn();
const mockUseSearchParams = jest.fn(() => new URLSearchParams());

jest.mock("next/navigation", () => ({
  useRouter: () => mockUseRouter(),
  useSearchParams: () => mockUseSearchParams(),
}));

describe("LoginPage", () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();
  const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  it("renders login form elements", () => {
    render(<LoginPage />);

    expect(screen.getByText("RestoInspect")).toBeInTheDocument();
    expect(screen.getByText("Field Reporting, Simplified.")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows/hides password when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByPlaceholderText("Password");
    const toggleButton = screen.getByRole("button", { name: "" }); // Eye icon button

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("handles successful login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({
      ok: true,
      error: null,
      status: 200,
      url: null,
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "admin@restoinspect.com");
    await user.type(passwordInput, "password123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "admin@restoinspect.com",
        password: "password123",
        redirect: false,
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it("shows error message on failed login", async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({
      ok: false,
      error: "Invalid credentials",
      status: 401,
      url: null,
    });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.type(emailInput, "wrong@example.com");
    await user.type(passwordInput, "wrongpassword");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
  });

  it("disables form during submission", async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                error: null,
                status: 200,
                url: null,
              }),
            100
          )
        )
    );

    render(<LoginPage />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });

    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Signing In...");

    await waitFor(() => {
      expect(submitButton).toBeEnabled();
    });
  });

  it("calls signIn with google provider when Google button is clicked", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const googleButton = screen.getByRole("button", { name: /continue with google/i });
    await user.click(googleButton);

    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/dashboard" });
  });
});
