import { useCallback, useRef, useState } from "react";
import { createRemoteAppComponent } from "@module-federation/bridge-react/base";
import ProfileCopilotRegistration from "./ProfileCopilotRegistration.jsx";
import "../../../../packages/theme/journey.css";

const noNavigation = () => {};

const LegacyProfileFeature = createRemoteAppComponent({
  loader: () => import("profile_ui_legacy/ProfileFeature"),
  loading: (
    <div className="remote-loading" role="status">
      Loading React 18 Profile UI
    </div>
  ),
  fallback: LegacyProfileFallback
});

export default function ProfileAdapter({ onNavigate = noNavigation }) {
  const integrationRef = useRef(null);
  const [profileIntegration, setProfileIntegration] = useState(null);

  const handleProfileIntegrationChange = useCallback((nextIntegration) => {
    const normalizedIntegration =
      nextIntegration &&
      typeof nextIntegration === "object" &&
      nextIntegration.context &&
      typeof nextIntegration.handler === "function"
        ? nextIntegration
        : null;

    integrationRef.current = normalizedIntegration;
    setProfileIntegration(normalizedIntegration);
  }, []);

  return (
    <>
      {profileIntegration ? (
        <ProfileCopilotRegistration
          profileContext={profileIntegration.context}
          integrationRef={integrationRef}
        />
      ) : null}

      <LegacyProfileFeature
        onNavigate={onNavigate}
        onProfileIntegrationChange={handleProfileIntegrationChange}
      />
    </>
  );
}

function LegacyProfileFallback({ error }) {
  return (
    <section className="remote-error" role="alert">
      <div>
        <strong>Profile UI is unavailable</strong>
        <span>
          {error instanceof Error
            ? error.message
            : "The nested React 18 bridge failed to load."}
        </span>
      </div>
      <button type="button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </section>
  );
}
