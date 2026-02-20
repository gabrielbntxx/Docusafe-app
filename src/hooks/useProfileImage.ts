"use client";

import { useState, useEffect } from "react";

/**
 * Hook pour récupérer l'URL signée de l'image de profil depuis R2
 * Gère automatiquement le cache et le rafraîchissement
 */
export function useProfileImage(initialImage: string | null | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      // Si pas d'image ou image non-R2 (anciennes images locales ou OAuth)
      if (!initialImage) {
        setImageUrl(null);
        setIsLoading(false);
        return;
      }

      // Si l'image n'est pas sur R2, utiliser directement l'URL
      if (!initialImage.startsWith("r2://")) {
        setImageUrl(initialImage);
        setIsLoading(false);
        return;
      }

      // Récupérer l'URL signée depuis l'API
      try {
        const response = await fetch("/api/profile/image");
        if (response.ok) {
          const data = await response.json();
          setImageUrl(data.imageUrl);
        } else {
          setError("Erreur lors du chargement de l'image");
          setImageUrl(null);
        }
      } catch (err) {
        console.error("Error fetching profile image:", err);
        setError("Erreur réseau");
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl().catch((err) => {
      console.error("Unhandled error in fetchImageUrl:", err);
      setIsLoading(false);
    });
  }, [initialImage]);

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/profile/image");
      if (response.ok) {
        const data = await response.json();
        setImageUrl(data.imageUrl);
      }
    } catch (err) {
      console.error("Error refreshing profile image:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { imageUrl, isLoading, error, refresh };
}
